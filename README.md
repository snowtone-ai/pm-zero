# pm-zero-claude

**AI を「指示する道具」から「自律実行できる同僚」に変えるための、再現可能な PM フレームワーク**

[![Version](https://img.shields.io/badge/version-8.0-blue)]()
[![Platform](https://img.shields.io/badge/platform-Claude_Code_2.1.116+-green)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

---

## 30 秒で理解する

非エンジニアが思いつく曖昧なプロダクトアイデアを、Claude Code（AI コーディングエージェント）が**人間の追加指示なしに最後まで実装できる成果物パッケージ**に変換するための、構造化された PM プロセスです。

入力：「○○ なアプリを作りたい」（自然言語、5〜30 文字）
↓
出力：CLAUDE.md / vision.md / settings.json / .env.example / setup.bat ほか **コア 11 ファイル**
↓
ユーザーが `claude` を起動すると、AI が自律的にコーディング・テスト・デプロイまで完遂

このシステムは **GitHub で公開**しており、コードベースは**エンジニアでない筆者一人**が、Claude との対話を通じて 7 か月で v1 → v8 まで進化させてきました。

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

## 技術スタック

| 領域 | 採用技術 | 採用根拠 |
|------|--------|--------|
| AI モデル基盤 | Claude Opus 4.7（設計） / Sonnet 4.6（実装） | コスト最適化：Sonnet が解決できないときのみ Opus |
| エージェント実行 | Claude Code v2.1.116+ | 公式 CLI、Hook / Subagent / MCP / Skill すべて活用 |
| 確定的ルール | Hook（公式機能） | LLM の確率的不遵守を Hook で外部強制 |
| 記憶 | filesystem-based memory | RLM / Managed Agents と同型の設計 |
| 役割分業 | Subagent + `isolation: worktree` | レビューを fresh context で行う安全設計 |
| ドキュメント参照 | context7 MCP | ライブラリ仕様の最新版を自動取得 |
| プロジェクト基盤 | Next.js + TypeScript strict + pnpm + Vercel | 標準スタック |
| 開発環境 | Windows + VSCode + PowerShell | ユーザー実環境に最適化 |

---

## 数値で見る pm-zero-claude

| 指標 | 値 | 比較対象 |
|------|----|------|
| CLAUDE.md 行数（目標） | ≤ 80 行 | 公式推奨 200 行以下 |
| Phase 1 質問数（圧縮後） | 15-25 問 | v5 比 70-90% トークン削減 |
| Hook 数（v8.0） | 7 種 | v7.3 の 10 種から削減 |
| Tier 1 Subagent 数 | 5 | 役割を絞り、context 汚染を防ぐ |
| 必須 MCP サーバー数 | 2 | コア（context7 + playwright）に絞る |
| 自己進化サイクル | プロジェクト完了ごと `/ev` → xp-rules.md（上限 10） | 知識のスケーラブル蓄積 |

---

## 設計上の特徴的な判断

### ① Karpathy 4 原則の組み込み

GitHub 50K+ stars を獲得した [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)（65 行）の 4 原則を、`.claude/rules/karpathy.md` に `globs: "**"` で全ファイル適用。「Surface Tradeoffs / Surgical Changes / Goal-Driven Execution」を AI コーディングの基本姿勢として組み込みます。

### ② 事実検証を設計プロセスに組み込む（Phase 0.5）

ユーザーが ChatGPT / Gemini / DeepSeek の 3 モデルに同じ依頼をしたところ、各モデルが**架空の機能**（存在しない MCP サーバー、未確認の RFC 番号、Pro プランで使えない Auto Mode 等）を含む設計案を出力しました。pm-zero-claude v8.0 はこれを Phase 0.5 で出力前に検出します。

### ③ Pro プラン制約の遵守

多くの公開ノウハウは Max プラン以上を前提にしています。pm-zero-claude は **$20/月の Pro プランで動作する**ことを設計制約として、利用不可機能（Auto Mode、Managed Agents API）を排除しています。

### ④ Anthropic 公式バグの知見を反映

2026-04-24 に Anthropic が公式に認めた「思考履歴消失バグ」（2026-03-26 〜 04-10 期間）を踏まえ、Claude Code v2.1.116 以上を必須として明示。state.md SSOT 設計の重要性を再強調しています。

---

## 自己進化システム

```
プロジェクト完了
    │
    ▼
/ev コマンド実行
    │
    ▼
issues.md（失敗ログ）+ decisions.md（成功知見）から教訓候補を抽出
    │
    ▼
ユーザー合議の上、xp-rules.md に追記（上限 10 項目、超えたら統廃合）
    │
    ▼
次プロジェクトの CLAUDE.md / .claude/rules/ に反映
```

このループは Anthropic が 2026-04-23 に public beta 公開した [Memory on Claude Managed Agents](https://www.anthropic.com/engineering/managed-agents) と **同じ設計哲学**（filesystem-based、auditable、exportable）に独立に到達しました。pm-zero-claude は v5 の段階で既にこの構造を持っています。

---

## バージョン履歴（要約）

| Version | リリース | 主要変更 |
|---------|---------|--------|
| v1 〜 v4 | 2025 | プロンプト集としての出発 |
| v5 | 2025 後半 | xp-rules.md による自己進化導入 |
| v6 | 2026-初 | Hook 導入、決定論的ルール強制 |
| v7.0 〜 v7.2 | 2026-03 〜 04 | Subagent / Skill / MCP の体系化 |
| v7.3 | 2026-04-22 | Permission 完全自動化（CLI flag + deny リスト二層） |
| **v8.0** | **2026-04-25** | **External Memory Architecture / Karpathy 4 原則 / Phase 0.5 Pre-Design Verification Gate** |

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

## 哲学

**「AI に長文を覚えさせる」設計ではなく、「正しい情報を引く・正しい責務に振る・正しい検証を自動化する」設計に切り替える。**

LLM の能力は急速に向上しますが、**コンテキストウィンドウは増えてもコンテキスト管理の難しさは消えません**。MIT の Recursive Language Models (2026-01) や Anthropic の Managed Agents Memory (2026-04) が示唆するのは、**LLM 自身が記憶を持つのではなく、LLM の外側に永続記憶を置き、LLM はそれをプログラム的に操作する**という構造です。pm-zero-claude はこの構造を、Pro プランの制約下で再現可能に実装した一例です。

---

## 想定される評価ポイント（採用担当者向け）

このプロジェクトを評価する際のポイントとして：

1. **再現性**：他の人が同じ手順で同じ品質の成果物を得られる構造になっているか
2. **第一原理思考**：なぜこの設計なのかが、AI モデルの確率的振る舞いの限界という第一原理から導出されているか
3. **事実ベースの設計**：架空機能を含めず、公式ドキュメント・公開研究を出典として明示しているか
4. **継続的改善**：xp-rules.md を通じた自己進化ループが、属人的でない仕組みとして組み込まれているか
5. **制約下での最適化**：Pro プラン（$20/月）という具体的制約に対して、トークン経済を悪化させずに設計品質を最大化しているか

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
