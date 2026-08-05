#!/usr/bin/env node
/**
 * pm-zero v11.2 — G_code builder / query tool
 * ==========================================
 * Zero runtime dependencies. Node >= 18. Windows-safe.
 *
 * Builds a static code graph into docs/graph/ and answers impact queries.
 * It is a PRIOR, not a proof: --impacted returns a FLOOR ("at minimum run
 * these"), never a ceiling. The final gate is always the full verify command.
 *
 *   node scripts/graph.mjs --init            build from scratch, write docs/graph/
 *   node scripts/graph.mjs --refresh [--quiet]   rebuild only if content changed
 *   node scripts/graph.mjs --check           exit 0 if graph matches tree, else 1
 *   node scripts/graph.mjs --impacted <f...> print at-risk tests + dependents
 *   node scripts/graph.mjs --stat            print serialized size in chars/est-tokens
 *
 * Exit codes: 0 ok · 1 stale/mismatch (--check) · 2 usage error · 3 internal error
 *
 * SUPPORT MATRIX
 *   tier 1 (import + test edges): .ts .tsx .js .jsx .mjs .cjs .py
 *   tier 2 (test edges only, by filename convention): everything else
 * Tier 2 is the documented degraded mode. Degraded is fine; absent is not.
 *
 * SINGLE WRITER: only ever invoke --refresh from the main agent (pre-commit).
 * Never from a PostToolUse hook while parallel workers run — concurrent
 * regeneration produces torn writes. A lockfile guards the accidental case.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync,
         statSync, rmSync, openSync, closeSync } from 'node:fs';
import { join, relative, resolve, sep, extname, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.env.CLAUDE_PROJECT_DIR
  ? resolve(process.env.CLAUDE_PROJECT_DIR)
  : process.cwd();
const OUT = join(ROOT, 'docs', 'graph');
const LOCK = join(OUT, '.lock');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out',
  '.next', 'coverage', '.venv', 'venv', '__pycache__', '.claude', 'target',
  '.turbo', '.cache', 'vendor', '.pnpm-store']);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py',
  '.go', '.rs', '.rb', '.java', '.cs', '.php', '.svelte', '.vue']);
const PARSEABLE = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py']);

const TOKEN_BUDGET = 40_000;          // §2-2 cap, in estimated tokens
const CHARS_PER_TOKEN = 4;            // crude but stable estimator

const norm = (p) => p.split(sep).join('/');

/* ------------------------------------------------------------------ walk */
function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.claude') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, acc);
    } else if (CODE_EXT.has(extname(e.name))) {
      acc.push(full);
    }
  }
  return acc;
}

const isTest = (rel) =>
  /(^|\/)(tests?|__tests__|spec)\//.test(rel) ||
  /\.(test|spec)\.[a-z]+$/.test(rel) ||
  /(^|\/)test_[^/]+\.py$/.test(rel) ||
  /_test\.[a-z]+$/.test(rel);

/* --------------------------------------------------------------- parsing */
// Deliberately regex-based: no AST dependency, no toolchain assumption.
// Misses dynamic imports, re-exports through barrels, DI, string-keyed
// routing. That is why --impacted is a floor. See §2-2 "Honest limit".
const RE = {
  jsImport: /(?:^|\n)\s*import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  jsRequire: /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  jsDynamic: /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  pyImport: /(?:^|\n)\s*(?:from\s+([.\w]+)\s+import|import\s+([.\w]+))/g,
  jsSymbol: /(?:^|\n)\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g,
  pySymbol: /(?:^|\n)(?:def|class)\s+([A-Za-z_]\w*)/g,
};

function specifiersOf(src, ext) {
  const out = new Set();
  const push = (m, i = 1) => { if (m[i]) out.add(m[i]); };
  if (ext === '.py') {
    for (const m of src.matchAll(RE.pyImport)) { push(m, 1); push(m, 2); }
  } else {
    for (const m of src.matchAll(RE.jsImport)) push(m);
    for (const m of src.matchAll(RE.jsRequire)) push(m);
    for (const m of src.matchAll(RE.jsDynamic)) push(m);
  }
  return [...out];
}

function symbolsOf(src, ext) {
  const re = ext === '.py' ? RE.pySymbol : RE.jsSymbol;
  return [...new Set([...src.matchAll(re)].map((m) => m[1]))].slice(0, 200);
}

/** Resolve an import specifier to a repo-relative file, or null if external. */
function resolveSpec(spec, fromRel, files) {
  if (!spec.startsWith('.')) {
    if (extname(fromRel) === '.py' && spec.startsWith('.')) { /* fallthrough */ }
    else return null;                                  // package import
  }
  const baseDir = dirname(fromRel);
  const guess = norm(join(baseDir, spec));
  const cands = [
    guess,
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py'].flatMap((e) => [
      guess + e, `${guess}/index${e}`,
    ]),
  ];
  for (const c of cands) if (files.has(c)) return c;
  return null;
}

/* ----------------------------------------------------------------- build */
function build() {
  const abs = walk(ROOT);
  const rels = abs.map((a) => norm(relative(ROOT, a)));
  const fileSet = new Set(rels);

  const parsed = new Map();
  for (let i = 0; i < abs.length; i++) {
    const rel = rels[i];
    const ext = extname(rel);
    let src = '';
    try { src = readFileSync(abs[i], 'utf8'); } catch { /* unreadable */ }
    parsed.set(rel, {
      ext,
      test: isTest(rel),
      specs: PARSEABLE.has(ext) ? specifiersOf(src, ext) : [],
      symbols: PARSEABLE.has(ext) ? symbolsOf(src, ext) : [],
      src: PARSEABLE.has(ext) ? src : '',
      size: src.length,
    });
  }

  // ---- import edges (file -> file)
  const imports = {};       // file -> [files it imports]
  const importedBy = {};    // file -> [files that import it]
  for (const [rel, info] of parsed) {
    const targets = [];
    for (const s of info.specs) {
      const t = resolveSpec(s, rel, fileSet);
      if (t && t !== rel) targets.push(t);
    }
    const uniq = [...new Set(targets)];
    if (uniq.length) imports[rel] = uniq;
    for (const t of uniq) (importedBy[t] ||= []).push(rel);
  }

  // ---- modules.json : directory coupling
  const dirOf = (f) => (dirname(f) === '.' ? '/' : dirname(f));
  const modEdges = {};
  for (const [from, tos] of Object.entries(imports)) {
    const a = dirOf(from);
    for (const to of tos) {
      const b = dirOf(to);
      if (a === b) continue;
      ((modEdges[a] ||= {})[b] ||= 0);
      modEdges[a][b]++;
    }
  }
  const modules = {
    nodes: [...new Set(rels.map(dirOf))].sort(),
    edges: Object.entries(modEdges).flatMap(([from, m]) =>
      Object.entries(m).map(([to, weight]) => ({ from, to, weight }))),
  };

  // ---- calls.json : symbol -> referencing files (name-based, coarse)
  const calls = { symbols: {} };
  for (const [rel, info] of parsed) {
    if (info.test || !info.symbols.length) continue;
    for (const sym of info.symbols) {
      if (sym.length < 4) continue;                    // too noisy to be useful
      const refs = [];
      const needle = new RegExp(`\\b${sym.replace(/[$]/g, '\\$')}\\b`);
      for (const cand of importedBy[rel] || []) {
        if (needle.test(parsed.get(cand)?.src || '')) refs.push(cand);
      }
      if (refs.length) calls.symbols[`${rel}#${sym}`] = refs;
    }
  }

  // ---- tests.json : source file -> covering test files  (THE important view)
  const covers = {};
  const testFiles = rels.filter((r) => parsed.get(r).test);
  for (const t of testFiles) {
    const direct = new Set(imports[t] || []);
    // convention fallback: foo.test.ts covers foo.ts anywhere in the tree
    const stem = basename(t).replace(/\.(test|spec)\./, '.')
                            .replace(/^test_/, '').replace(/_test\./, '.');
    for (const r of rels) {
      if (parsed.get(r).test) continue;
      if (direct.has(r) || basename(r) === stem) (covers[r] ||= new Set()).add(t);
    }
  }
  // transitive closure: if A is covered and B imports A, B's tests cover B too
  for (const [file, importers] of Object.entries(importedBy)) {
    for (const imp of importers) {
      if (parsed.get(imp)?.test) (covers[file] ||= new Set()).add(imp);
    }
  }
  const tests = {
    covers: Object.fromEntries(
      Object.entries(covers).map(([k, v]) => [k, [...v].sort()])),
    testFiles: testFiles.sort(),
    uncovered: rels.filter((r) => !parsed.get(r).test && !covers[r]).sort(),
  };

  // ---- zones.json : path globs -> governing rule files
  const rulesDir = join(ROOT, '.claude', 'rules');
  const zones = { zones: [] };
  if (existsSync(rulesDir)) {
    for (const f of readdirSync(rulesDir).filter((f) => f.endsWith('.md'))) {
      const src = readFileSync(join(rulesDir, f), 'utf8');
      const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const globs = fm
        ? [...fm[1].matchAll(/^\s*-\s*["']?([^"'\n]+)["']?\s*$/gm)].map((m) => m[1].trim())
        : [];
      zones.zones.push({ rule: `.claude/rules/${f}`, paths: globs });
    }
  }

  return {
    modules,
    calls,
    tests,
    zones,
    meta: {
      generator: 'pm-zero graph.mjs v11.2',
      generatedAt: new Date().toISOString(),
      fileCount: rels.length,
      testCount: testFiles.length,
      parseable: rels.filter((r) => PARSEABLE.has(parsed.get(r).ext)).length,
      degraded: rels.filter((r) => !PARSEABLE.has(parsed.get(r).ext)).length,
      treeHash: hashTree(rels, parsed),
    },
  };
}

/** Hash of (path, size) pairs — cheap staleness signal that ignores mtime. */
function hashTree(rels, parsed) {
  const h = createHash('sha256');
  for (const r of [...rels].sort()) h.update(`${r}:${parsed.get(r).size}\n`);
  return h.digest('hex').slice(0, 16);
}

/* ------------------------------------------------------------------- io */
function writeGraph(g) {
  mkdirSync(OUT, { recursive: true });
  let fd;
  try { fd = openSync(LOCK, 'wx'); }
  catch {
    process.stderr.write(
      'graph.mjs: another writer holds docs/graph/.lock — skipping.\n' +
      '  If no other run is active, delete docs/graph/.lock.\n');
    return false;
  }
  try {
    for (const k of ['modules', 'calls', 'tests', 'zones']) {
      const tmp = join(OUT, `${k}.json.tmp`);
      writeFileSync(tmp, JSON.stringify(g[k], null, 0));
      // atomic-ish replace
      writeFileSync(join(OUT, `${k}.json`), readFileSync(tmp));
      rmSync(tmp, { force: true });
    }
    writeFileSync(join(OUT, 'meta.json'), JSON.stringify(g.meta, null, 2));
    return true;
  } finally {
    // Order matters: close the descriptor BEFORE unlinking. On Windows and on
    // some network/overlay mounts, unlinking an open file raises EPERM, which
    // would turn a successful write into a reported failure.
    try { closeSync(fd); } catch { /* already closed */ }
    try { rmSync(LOCK, { force: true }); } catch { /* stale lock; --init clears it */ }
  }
}

const readJSON = (n) => {
  try { return JSON.parse(readFileSync(join(OUT, n), 'utf8')); }
  catch { return null; }
};

function serializedTokens(g) {
  const chars = ['modules', 'calls', 'tests', 'zones']
    .reduce((n, k) => n + JSON.stringify(g[k]).length, 0);
  return { chars, tokens: Math.round(chars / CHARS_PER_TOKEN) };
}

/* ------------------------------------------------------------- commands */
function cmdImpacted(targets) {
  const tests = readJSON('tests.json');
  const calls = readJSON('calls.json');
  const modules = readJSON('modules.json');
  if (!tests) {
    process.stdout.write(
      'GRAPH ABSENT — run `node scripts/graph.mjs --init`.\n' +
      'FLOOR: run the full verify command.\n');
    return 0;
  }
  const wanted = targets.map((t) => norm(relative(ROOT, resolve(ROOT, t))));
  const atRisk = new Set();
  const dependents = new Set();

  for (const w of wanted) {
    for (const t of tests.covers[w] || []) atRisk.add(t);
    for (const [key, refs] of Object.entries(calls?.symbols || {})) {
      if (!key.startsWith(`${w}#`)) continue;
      for (const r of refs) {
        dependents.add(r);
        for (const t of tests.covers[r] || []) atRisk.add(t);
      }
    }
  }

  const uncovered = wanted.filter((w) => !(tests.covers[w] || []).length);
  const lines = [];
  lines.push(`IMPACTED (floor — run at minimum; the gate is still full verify)`);
  lines.push(`targets: ${wanted.join(', ')}`);
  lines.push('');
  lines.push(`tests at risk (${atRisk.size}):`);
  lines.push(atRisk.size ? [...atRisk].sort().map((t) => `  ${t}`).join('\n')
                         : '  (none found)');
  if (dependents.size) {
    lines.push('');
    lines.push(`direct dependents (${dependents.size}):`);
    lines.push([...dependents].sort().slice(0, 40).map((d) => `  ${d}`).join('\n'));
  }
  if (uncovered.length) {
    lines.push('');
    lines.push('WARNING — no covering test found for:');
    for (const u of uncovered) lines.push(`  ${u}`);
    lines.push('  A change here is unguarded. Write a test before editing (Q7).');
  }
  const mod = modules?.edges?.filter((e) =>
    wanted.some((w) => e.to === (dirname(w) === '.' ? '/' : dirname(w)))) || [];
  if (mod.length) {
    lines.push('');
    lines.push(`modules depending on the changed directories: ` +
      [...new Set(mod.map((e) => e.from))].join(', '));
  }
  process.stdout.write(lines.join('\n') + '\n');
  return 0;
}

function main() {
  const argv = process.argv.slice(2);
  const has = (f) => argv.includes(f);
  const quiet = has('--quiet');
  const say = (s) => { if (!quiet) process.stdout.write(s); };

  try {
    if (has('--impacted')) {
      const i = argv.indexOf('--impacted');
      const files = argv.slice(i + 1).filter((a) => !a.startsWith('--'));
      if (!files.length) { process.stderr.write('usage: --impacted <file...>\n'); return 2; }
      return cmdImpacted(files);
    }

    if (has('--check')) {
      const meta = readJSON('meta.json');
      if (!meta) { process.stderr.write('graph.mjs: docs/graph/ missing. Run --init.\n'); return 1; }
      const fresh = build();
      if (fresh.meta.treeHash !== meta.treeHash) {
        process.stderr.write(
          `graph.mjs: STALE. tree=${fresh.meta.treeHash} graph=${meta.treeHash}\n` +
          `  Run: node scripts/graph.mjs --refresh\n`);
        return 1;
      }
      say('graph.mjs: fresh.\n');
      return 0;
    }

    if (has('--stat')) {
      const g = build();
      const { chars, tokens } = serializedTokens(g);
      process.stdout.write(
        `files=${g.meta.fileCount} tests=${g.meta.testCount} ` +
        `parseable=${g.meta.parseable} degraded=${g.meta.degraded}\n` +
        `serialized=${chars} chars ≈ ${tokens} tokens (budget ${TOKEN_BUDGET})\n` +
        (tokens > TOKEN_BUDGET
          ? `OVER BUDGET — narrow SKIP_DIRS or split the repo (§2-2).\n` : ''));
      return tokens > TOKEN_BUDGET ? 1 : 0;
    }

    // --init / --refresh (default)
    const g = build();
    const prev = readJSON('meta.json');
    if (has('--refresh') && prev && prev.treeHash === g.meta.treeHash) {
      say('graph.mjs: unchanged.\n');
      return 0;
    }
    if (!writeGraph(g)) return 0;              // lock held: not an error
    const { tokens } = serializedTokens(g);
    say(`graph.mjs: wrote docs/graph/ — ${g.meta.fileCount} files, ` +
        `${g.meta.testCount} tests, ${g.tests.uncovered.length} uncovered, ` +
        `≈${tokens} tokens.\n`);
    if (tokens > TOKEN_BUDGET) {
      process.stderr.write(`graph.mjs: WARNING over the ${TOKEN_BUDGET}-token budget.\n`);
    }
    return 0;
  } catch (err) {
    // Fail OPEN and loud: a graph bug must never block the operator.
    process.stderr.write(`graph.mjs: internal error (failing open): ${err?.stack || err}\n`);
    return 3;
  }
}

process.exit(main());
