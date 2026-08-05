#!/usr/bin/env node
/**
 * pm-zero v11.2 — Stop hook: the Coding Loop's terminator
 * ======================================================
 * Install at ~/.claude/hooks/loop.mjs and wire as a global `Stop` hook.
 * Zero dependencies (no jq). Node >= 18. Windows-safe.
 *
 * CONTRACT (docs: code.claude.com/docs/en/hooks)
 *   stdin  : Stop event JSON, includes { stop_hook_active, transcript_path, cwd }
 *   stdout : {"decision":"block","reason":…,"systemMessage":…}  -> continue
 *   exit 0 : with no stdout -> allow the stop
 *
 * DESIGN NOTES — read before changing anything.
 *
 * 1. We do NOT exit early on `stop_hook_active`. The docs suggest that as the
 *    simple way to avoid the block cap, but it makes the loop single-shot:
 *    the flag is true from the second Stop onward. Anthropic's own
 *    ralph-wiggum plugin also does not check it — it carries an iteration
 *    counter in a state file. We do the same, and additionally keep our cap
 *    strictly BELOW the platform's CLAUDE_CODE_STOP_HOOK_BLOCK_CAP (default 8)
 *    so our clean exit always fires first. `stop_hook_active` is used only as
 *    a corroborating signal for the counter.
 *
 * 2. We do NOT run the gate here. Hooks are synchronous and a full test suite
 *    can exceed the hook timeout; a timed-out hook is a non-blocking error,
 *    which silently ALLOWS the stop and disables the loop with no signal.
 *    Instead the agent runs the gate and records the result in the state file.
 *    We verify that record is fresh by comparing its commit sha to HEAD.
 *
 * 3. We FAIL OPEN, loudly. Any internal error allows the stop and prints why.
 *    A broken loop hook must never make Claude Code unusable.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const MAX_STDIN_MS = 3000;
const OUR_CAP = Number(process.env.PMZERO_LOOP_MAX_ITERATIONS || 6); // < platform 8

/** Allow the stop. */
function allow(note) {
  if (note) process.stderr.write(`loop.mjs: ${note}\n`);
  process.exit(0);
}

/** Block the stop; `reason` becomes Claude's next input. */
function block(reason, systemMessage) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason, systemMessage }));
  process.exit(0);
}

function readStdin() {
  return new Promise((res) => {
    let buf = '';
    const done = (v) => { clearTimeout(t); res(v); };
    const t = setTimeout(() => done(buf), MAX_STDIN_MS);   // Node #46601 guard
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (d) => (buf += d));
    process.stdin.on('end', () => done(buf));
    process.stdin.on('error', () => done(buf));
  });
}

/** Run a command, trimming surrounding whitespace. For single-value output. */
const sh = (cmd, args, cwd) => shRaw(cmd, args, cwd)?.trim() ?? null;

/** Run a command WITHOUT trimming. Required for `git status --porcelain`,
 *  whose status column is two characters wide and may begin with a space
 *  (" M path"). Trimming eats that space and shifts every path by one
 *  character. (Caught by test T6/T7: paths became "ocs/issues.md".) */
const shRaw = (cmd, args, cwd) => {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return null; }
};

async function main() {
  const raw = await readStdin();
  let ev = {};
  try { ev = JSON.parse(raw || '{}'); } catch { return allow('unparseable event; failing open'); }

  const cwd = ev.cwd || process.cwd();
  const statePath = join(cwd, '.claude', 'loop.local.json');

  // --- not armed: this project is not running the Coding Loop.
  if (!existsSync(statePath)) return allow(null);

  let st;
  try { st = JSON.parse(readFileSync(statePath, 'utf8')); }
  catch { return allow('state file corrupt; failing open'); }

  const bump = (patch) => {
    try { writeFileSync(statePath, JSON.stringify({ ...st, ...patch }, null, 2)); }
    catch { /* non-fatal */ }
  };

  const finish = (reasonCode, msg) => {
    bump({ finished: true, finishedAt: new Date().toISOString(), reasonCode });
    try {
      appendFileSync(join(cwd, 'docs', 'issues.md'),
        `\n- loop ${st.task}: ended (${reasonCode}) after ${st.iteration} iterations` +
        `${st.lastFailureSignature ? `, last signature \`${st.lastFailureSignature}\`` : ''}\n`);
    } catch { /* docs/ may not exist yet */ }
    return allow(msg);
  };

  // --- guard 1: already finished
  if (st.finished) return allow('loop already finished');

  // --- guard 2: our iteration cap, strictly below the platform block cap
  const iteration = Number(st.iteration || 0);
  if (iteration >= OUR_CAP) {
    return finish('iteration-cap',
      `iteration cap ${OUR_CAP} reached — writing handoff and stopping cleanly`);
  }

  // --- guard 3: the platform is about to override us anyway
  if (ev.stop_hook_active && iteration >= OUR_CAP - 1) {
    return finish('platform-cap-imminent', 'approaching platform block cap; stopping cleanly');
  }

  // --- read the gate result the AGENT recorded (we never run the gate here)
  const g = st.lastGate || {};
  const head = sh('git', ['rev-parse', 'HEAD'], cwd);

  // Dirty-tree check, minus pm-zero's own bookkeeping. Without this filter the
  // loop jams permanently: .claude/loop.local.json is rewritten by this very
  // hook and docs/graph/ is rewritten on every structural edit, so the tree is
  // never clean and every gate result reads as stale. (Caught by test T2-T7.)
  const BOOKKEEPING = /^(\.claude\/|docs\/graph\/|docs\/issues\.md|docs\/state\.md)/;
  const dirty = (shRaw('git', ['status', '--porcelain'], cwd) || '')
    .split('\n')
    .map((l) => {
      const m = /^(..)\s(.*)$/.exec(l);           // two-char status, then path
      if (!m) return '';
      const p = m[2].trim();
      return p.includes(' -> ') ? p.split(' -> ')[1] : p;   // renames
    })
    .filter(Boolean)
    .filter((p) => !BOOKKEEPING.test(p));

  const stale =
    !g.command ||
    g.sha !== head ||          // the gate ran against a different commit
    dirty.length > 0 ||        // source changed since the gate ran
    !g.at ||
    (Date.now() - Date.parse(g.at)) > 30 * 60 * 1000;

  if (stale) {
    bump({ iteration: iteration + 1 });
    return block(
      [
        `The Coding Loop is armed for task ${st.task} but there is no fresh gate result.`,
        ``,
        `Do this now, in order:`,
        `  1. commit your work in progress (the tree must be clean),`,
        `  2. run the gate:  ${st.gate}`,
        `  3. record the result by writing .claude/loop.local.json with`,
        `     lastGate = { command, exitCode, sha: <git rev-parse HEAD>, at: <ISO now>,`,
        `                  signature: <normalized failure signature, or null> }`,
        ``,
        `Do not stop. Do not mark the task verified until exitCode is 0.`,
      ].join('\n'),
      `pm-zero loop ${iteration + 1}/${OUR_CAP} — no fresh gate result`);
  }

  // --- gate is green
  if (g.exitCode === 0) {
    const frontier = Array.isArray(st.frontier) ? st.frontier : [];
    if (frontier.length === 0) {
      return finish('complete', 'gate green and frontier empty — allowing stop');
    }
    bump({ iteration: iteration + 1, lastFailureSignature: null });
    return block(
      [`Gate green for ${st.task}. ${frontier.length} task(s) remain in the frontier:`,
       ...frontier.map((t) => `  - ${t}`),
       ``,
       `Take the next one: read its row in tasks.md, run`,
       `  node scripts/graph.mjs --impacted <its write scope>`,
       `then implement it. Update .claude/loop.local.json (task, gate, frontier)`,
       `before you finish this turn.`].join('\n'),
      `pm-zero loop ${iteration + 1}/${OUR_CAP} — advancing to next node`);
  }

  // --- gate is red: escalation ladder driven by the failure signature
  const sig = g.signature || `exit${g.exitCode}`;
  const repeats = sig && sig === st.lastFailureSignature
    ? Number(st.repeatCount || 1) + 1 : 1;

  const ladder = {
    1: `Fix it. Run \`node scripts/graph.mjs --impacted <changed files>\` first and make
the tests it names pass. Do not weaken or skip any test.`,
    2: `This is the SECOND time with the same failure signature. Do not retry the same
approach. WEB-SEARCH the exact error string now, and record the finding plus its
source URL in docs/issues.md before your next edit.`,
    3: `THIRD identical failure. Stop editing. Spawn a fresh subagent on Opus for a
root-cause pass, giving it: the diff, the failing output, and the graph
neighbourhood from scripts/graph.mjs. Act only on its finding.`,
  };

  if (repeats >= 4) {
    return finish('escalation-exhausted',
      'four identical failure signatures — marking blocked and stopping cleanly');
  }

  bump({ iteration: iteration + 1, lastFailureSignature: sig, repeatCount: repeats });
  return block(
    [`Gate RED for ${st.task}.`,
     `  command : ${g.command}`,
     `  exit    : ${g.exitCode}`,
     `  signature: ${sig} (occurrence ${repeats})`,
     ``,
     ladder[repeats] || ladder[3],
     ``,
     g.output ? `--- gate output (trimmed) ---\n${String(g.output).slice(0, 4000)}` : '',
     ``,
     `Do not stop while this gate is red. Do not mark the task verified.`].join('\n'),
    `pm-zero loop ${iteration + 1}/${OUR_CAP} — gate red, signature x${repeats}`);
}

main().catch((e) => allow(`internal error, failing open: ${e?.message || e}`));
