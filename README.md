# pm-zero-claude v9.0

**Vendor-neutral Agent Operating System** — 非エンジニアの自然言語アイデアを、Claude Code または Codex CLI が自律実行できる成果物パッケージに変換するPMフレームワーク。

> v8.0は Claude Code 専用のPMフレームワークでした。v9.0では Codex CLI にも対応し、AIが「動くコード」ではなく「変更に耐えるコード」を生成するよう、OS側から品質を強制します。

---

## なぜ pm-zero v9.0 なのか

AIにコードを書かせると、動くけど誰も修正できないものができる。責務が混在し、テストがなく、命名が曖昧で、エラーハンドリングが甘い。これはAIが悪いのではなく、OSが品質を強制していないから。

pm-zero v9.0 はこの問題を、7つの品質ゲートとReference-First設計で構造的に解決します。

---

## 特徴

| 特徴 | 内容 |
|---|---|
| 🔀 **Vendor-neutral** | Claude Code / Codex CLI の両対応。将来どちらかが消えても破綻しない |
| 🚀 **Codex-first** | 実装フェーズの第一想定は Codex CLI（GPT-5.5） |
| 🔍 **Reference-First** | 実装前に実在類似例3件以上を必ず参照・記録する |
| 🏆 **Top-Engineer Quality Gate** | 7ゲートを通過しない限り完了報告不可 |
| 🤖 **AI自己検証11ステップ** | lint → typecheck → build → test → dev → Playwright → 日本語報告 |
| 📦 **最初から全58ファイル** | 段階追加なし。Phase 2で一括生成 |
| 🇯🇵 **日本語徹底** | 英語で完了報告したら自動ブロック・再出力 |
| 💰 **Pro/Plus制約最適化** | Claude Pro $20 + ChatGPT Plus $20 = 月$40で動作 |

---

## アーキテクチャ概要

```
Claude.ai Project（v9.0 Knowledge）
  │ Phase 0：事前リサーチ
  │ Phase 0.5：自己検証ゲート（架空機能検出）
  │ Phase 0.6：Reference-First Research（実在例3件以上）← v9.0 新規
  │ Phase 1：4ステージインタビュー（3-5問/ターン）
  │ Phase 2：全58ファイル一括生成 ← v9.0 新規
  ▼
プロジェクトフォルダ
  ├── L1: OS Kernel     AGENTS.md（一次ソース）+ CLAUDE.md（薄い参照層）
  ├── L2: Model Routing フェーズ別モデル配分（3パターン）
  ├── L3: CLI Adapter   Claude設定 / Codex設定の差分吸収
  ├── L4: Memory        state.md / decisions.md / issues.md（v8.0継承）
  ├── L5: MCP           playwright + context7
  ├── L6: Verification  scripts/verify.mjs（両CLI共通）
  ├── L7: Security      deny list + guardrail
  ├── L8: Handoff       HANDOFF-JA.md（日本語テンプレ）
  ├── L9: Migration     v8→v9移行手順
  └── L10: Quality Gate CODE-QUALITY / ARCHITECTURE-RULES / REVIEW-GATE / REFERENCE-GUIDE
```

---

## v8.0 との主な違い

| 観点 | v8.0 | v9.0 |
|---|---|---|
| 対応CLI | Claude Code のみ | **Claude Code + Codex CLI** |
| 一次指示書 | CLAUDE.md | **AGENTS.md**（AAIF標準） |
| 実装優先 | Claude Code | **Codex CLI**（Claude Code fallback） |
| 品質保証 | 基本的なhook | **7ゲート品質強制** |
| 参照戦略 | AIの内部知識 | **Reference-First（実在例3件必須）** |
| ファイル生成 | 段階追加 | **最初から全58ファイル一括** |
| 日本語強制 | CLAUDE.md記述のみ | **check-japanese.mjs hookでブロック** |
| モデル配分 | Claude Proのみ | **3パターン（併用/Pro/Plus）** |
| subagent | 5種 | **7種（refactor-reviewer / playwright-verifier 追加）** |

---

## 対応環境

| 項目 | 要件 |
|---|---|
| OS | Windows 10/11 + PowerShell 5.1 / 7+ |
| エディタ | VSCode |
| Claude Code | **v2.1.116 以上**（必須） |
| Codex CLI | **v0.115 以上**（任意・Codex使用時） |
| Node.js | 24.x |
| パッケージマネージャー | pnpm（推奨） |
| サブスクリプション | Claude Pro（$20/月）または ChatGPT Plus（$20/月）以上 |

---

## クイックスタート

### 1. Project Knowledge に v9.0 ナレッジを登録

Claude.ai の「プロジェクト」を作成し、このリポジトリの `pm-zero-claude-knowledge-v9.0.md` を Knowledge にアップロードします。

### 2. バージョン確認

```powershell
claude --version   # 2.1.116 以上であること
codex --version    # 0.115 以上であること（Codex使用時）
```

### 3. 新規プロジェクトの開始

Claude.ai で以下のように依頼します：

```
pm-zero v9.0 で新しいプロジェクトを始めたい。
作りたいもの：[あなたのアイデアを一文で]
```

→ Phase 0（リサーチ）→ Phase 0.5（自己検証）→ Phase 0.6（実在例検索）→ Phase 1（インタビュー）→ Phase 2（全58ファイル一括生成）の順で進みます。

### 4. ファイル配置

```powershell
# setup.bat をダブルクリックまたは実行
setup.bat

# 生成された58ファイルをプロジェクトフォルダに配置
# .env.local に API キーを記入
```

### 5. CLI 起動

```powershell
# Claude Code を使う場合
claude --permission-mode bypassPermissions

# Codex CLI を使う場合
codex --sandbox danger-full-access
```

---

## 生成されるファイル一覧（全58ファイル）

<details>
<summary>L1: OS Kernel（4ファイル）</summary>

- `AGENTS.md` — 一次指示書（≤80行、AAIF標準）
- `CLAUDE.md` — Claude Adapter（≤30行、@import AGENTS.md）
- `CODEX.md` — Codex補足（任意）
- `OS-KERNEL.md` — OS思想・共通原則

</details>

<details>
<summary>L2-L3: Routing & Adapter（4ファイル）</summary>

- `MODEL-ROUTING.md` — モデル配分3パターン
- `CLI-ADAPTERS.md` — CLI差分吸収マトリクス
- `.claude/settings.json` — Claude設定（hook + deny list）
- `.codex/config.toml` — Codex設定（approval_policy + sandbox_mode + hooks）

</details>

<details>
<summary>L4: External Memory（7ファイル、v8.0継承）</summary>

- `vision.md` — 仕様（Given/When/Then）
- `state.md` — 現在状態（SSOT）
- `decisions.md` — 永続判断 + **実在例URL（v9.0）**
- `issues.md` — 失敗ログ
- `escape.md` — エスカレーション履歴
- `xp-rules.md` — プロジェクト横断教訓（≤10項目）
- `design-notes.md` — 将来変更可能性（**v9.0新規**）

</details>

<details>
<summary>L5-L9（7ファイル）</summary>

- `.mcp.json` — MCP設定（playwright + context7）
- `VERIFICATION.md` — 自己検証パイプライン仕様
- `scripts/verify.mjs` — 統一検証エントリ（両CLI共通）
- `scripts/sync-claude-md.mjs` — AGENTS.md→CLAUDE.md同期
- `SECURITY.md` — deny / guardrail
- `HANDOFF-JA.md` — 日本語Handoffテンプレ
- `MIGRATION.md` — v8→v9移行手順

</details>

<details>
<summary>L10: Quality Gate（4ファイル）</summary>

- `CODE-QUALITY.md` — コード品質基準
- `ARCHITECTURE-RULES.md` — レイヤ分離・依存方向
- `REVIEW-GATE.md` — レビュー規則
- `REFERENCE-GUIDE.md` — Reference-First運用（**v9.0新規**）

</details>

<details>
<summary>Claude rules / agents / skills / hooks（22ファイル）</summary>

**rules**: karpathy.md / coding-standards.md / testing.md

**agents**: planner / test-writer / implementer / architect-reviewer / refactor-reviewer★ / playwright-verifier★ / docs-writer

**skills**: resume / escape / audit / reference★ / ev / env-guide / console-debug / verify

**hooks**: inject-state / freeze-state / format-and-update / log-error / block-dangerous / stop-guard / check-japanese★ / check-state

（★ = v9.0新規）

</details>

<details>
<summary>Codex hooks / Setup（6ファイル）</summary>

- `.codex/hooks/inject-state.mjs`
- `.codex/hooks/stop-guard.mjs`
- `.codex/hooks/check-japanese.mjs`
- `setup.bat`
- `.env.example`
- `.gitignore`

</details>

---

## Top-Engineer Code Quality Gate（7ゲート）

AIが完了報告するには、以下7ゲートを**すべて**通過する必要があります。

```
✅ Code Gate         関数長≤50行 / ファイル長≤300行 / 命名禁止語 / エラーハンドリング
✅ Architecture Gate レイヤ依存方向 / 循環依存0件 / 過剰抽象化検出
✅ Test Gate         新機能=新テスト / negative path / console error 0件
✅ Error Gate        catch-and-ignore禁止 / 失敗ケース仕様化
✅ Review Gate       architect-reviewer / refactor-reviewer / cross-vendor review
✅ Reference Gate    実在例3件以上参照 → decisions.md記録（★v9.0）
✅ Handoff Gate      日本語報告 / HANDOFF-JA.mdテンプレ準拠
```

---

## モデル配分（3パターン）

<details>
<summary>Pattern A：Claude Pro + ChatGPT Plus 併用（月$40・推奨）</summary>

| フェーズ | モデル |
|---|---|
| リサーチ / Reference検索 | GPT-5.5 Thinking |
| 要件定義 / 設計 | Claude Opus 4.7 |
| Codex CLI 実装 | GPT-5.5（reasoning=high） |
| 軽量修正 / サブエージェント | GPT-5.4-mini |
| Cross-vendor レビュー | Opus 4.7 + GPT-5.5（両方） |
| 日本語最終案内 | Claude Sonnet 4.6 |

</details>

<details>
<summary>Pattern B：Claude Pro のみ（月$20）</summary>

実装CLIはClaude Code。AGENTS.mdを維持しつつCLAUDE.mdを実行入口にする。計画にOpus 4.7、通常実装にSonnet 4.6、軽量にHaiku 4.5を配分。

</details>

<details>
<summary>Pattern C：ChatGPT Plus のみ（月$20）</summary>

実装CLIはCodex CLI。設計にGPT-5.5 Thinking、通常実装にGPT-5.5、軽量にGPT-5.4-miniを配分。

</details>

---

## AI自己検証パイプライン（11ステップ）

```
[1]  完了検知（Stop hook）
[2]  パッケージマネージャー判定
[3]  pnpm install 必要性判断・実行
[4]  lint / typecheck / format:check
[5]  pnpm build
[6]  unit / integration / e2e テスト
[7]  pnpm dev（port衝突自動回避）
[8]  Playwright MCP：画面/console/screenshot
[9]  主要ユーザーフロー（login/form/responsive/a11y）
[10] エラー分類 → 修正ループ（最大3反復）
[11] 日本語完了報告（HANDOFF-JA.mdテンプレ）
```

**「ユーザーが pnpm dev を実行してください」は禁止。**  
AIが実行できることはAIが先に実行し、失敗した場合のみ人間に依頼する。

---

## 人間が介入すべき最小地点

| 人間が必要 | 理由 |
|---|---|
| API キー発行 | ブラウザ操作必須 |
| OAuth 承認 | ブラウザ操作必須 |
| 課金承認 | 法的責任 |
| 本番 deploy 最終承認 | 影響範囲の確認 |
| 最終UI/UX体感確認 | 主観領域 |

それ以外（install / test / lint / build / push / browser確認）はすべてAIが実行。

---

## Reference-First Research Loop（★v9.0 新規）

**設計動機：AIのUI/UX判断は、コードとして読む内部表現と人間の視覚的判断の間に構造的なズレが生じる。このズレを実在例の参照によって埋める。**

実装前に必ず：
1. 類似する実在例を `web_search` で **3件以上** 取得
2. URL・採用要素・避けるべき要素を `decisions.md` に記録
3. 記録を踏まえて実装計画を立てる

実装後に必ず：
1. Playwright MCP で screenshot を取得
2. 参照した実在例と視覚的に比較
3. ズレがある場合は `decisions.md` に「ズレ理由」を明記

---

## v8.0 から v9.0 への移行

```powershell
# Step 1: Project Knowledge を v9.0 に差し替え

# Step 2: 既存プロジェクトを整理
# 残す：state.md / decisions.md / issues.md / escape.md /
#       xp-rules.md / vision.md / .env.example /
#       .claude/hooks / .claude/agents / .claude/rules/karpathy.md
# 削除：CLAUDE.md（v8.0版）

# Step 3: Claude.ai で移行を依頼
# 「v9.0 として既存プロジェクト [名前] を移行したい」

# Step 4: 全58ファイルを配置

# Step 5: 動作確認
pnpm verify
claude --permission-mode bypassPermissions
```

---

## プロジェクト構造（v8.0との比較）

### v8.0（Claude Code専用・3層）
```
Policy（CLAUDE.md）
  ↓
External Memory（state.md / decisions.md / ...）
  ↓
Execution（Claude Code + hooks + agents）
```

### v9.0（Vendor-neutral・10層）
```
OS Kernel（AGENTS.md）
  ↓
Model Routing / CLI Adapter / Memory / MCP
  ↓
Verification Pipeline（scripts/verify.mjs）
  ↓
Permission / Handoff / Migration
  ↓
Quality Gate（7ゲート）
```

---

## 採用している標準・技術（実在確認済み）

| 技術 | 用途 | 根拠 |
|---|---|---|
| AGENTS.md | 一次指示書フォーマット | AAIF / Linux Foundation 標準（2025-12-09） |
| MCP（Model Context Protocol） | ツール接続 | Anthropic → AAIF 寄贈。OpenAI / Codex も対応 |
| `@playwright/mcp` | ブラウザ自動確認 | Microsoft 公式（`github.com/microsoft/playwright-mcp`） |
| `@upstash/context7-mcp` | ライブラリドキュメント | npm 実在確認済み |
| Karpathy 4原則 | コーディング指針 | `forrestchang/andrej-karpathy-skills`（65行/2.3KB） |
| `dependency-cruiser` | 依存方向検証 | npm 実在確認済み |
| `madge --circular` | 循環依存検出 | npm 実在確認済み |

---

## FAQ

**Q: 非エンジニアでも使えますか？**  
A: はい。これはPMフレームワークです。コードを書く必要はなく、アイデアを日本語で伝えるだけです。

**Q: Claude Pro だけでも使えますか？**  
A: 使えます。Pattern B（Claude Pro単独）として設計済みです。Codex CLI は不使用になります。

**Q: ChatGPT Plus だけでも使えますか？**  
A: 使えます。Pattern C（ChatGPT Plus単独）として設計済みです。Claude Code は不使用になります。

**Q: v8.0 のプロジェクトを移行できますか？**  
A: できます。`MIGRATION.md` に非エンジニア向け移行手順を記載しています。既存の state.md / decisions.md などはそのまま引き継がれます。

**Q: 「最初から全58ファイル」は多すぎませんか？**  
A: Phase 2 で一括生成されるので、ユーザーが個別に作業する必要はありません。v8.0 で「後追加で混乱した」教訓から、最初に全部揃える設計にしました。

**Q: Codex CLI の Windows 対応は安定していますか？**  
A: 2026-05 時点で "experimental" 扱いです（OpenAI 公式）。本番環境では WSL2 を推奨します。

---

## ライセンス

MIT

---

## 関連リソース

- [Anthropic Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [OpenAI Codex CLI 公式ドキュメント](https://developers.openai.com/codex)
- [AGENTS.md 公式サイト](https://agents.md)
- [Agentic AI Foundation (AAIF)](https://aaif.io)
- [Playwright MCP](https://playwright.dev/docs/getting-started-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)

---

*pm-zero-claude v9.0 — Codex-first Dual Adapter OS with Top-Engineer Quality Gate & Reference-First Verification*  
*2026-05-04 更新 | Claude Code 2.1.116+ / Codex CLI 0.115+ / Windows + PowerShell 前提*
