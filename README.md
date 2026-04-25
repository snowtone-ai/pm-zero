# pm-zero-claude

**AI を「指示する道具」から「自律実行できる同僚」に変えるための、再現可能な PM フレームワーク**

[![Version](https://img.shields.io/badge/version-8.0-blue)]()
[![Platform](https://img.shields.io/badge/platform-Claude_Code_2.1.116+-green)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

---

## 30 秒で理解する

非エンジニアが思いつく曖昧なプロダクトアイデアを、Claude Code（AI コーディングエージェント）が**人間の追加指示なしに最後まで実装できる成果物パッケージ**に変換するための、構造化された PM プロセスです。

入力：「○○ なアプリを作りたい」（自然言語）
↓
出力：CLAUDE.md / vision.md / settings.json / .env.example / setup.bat ほか **コア 11 ファイル**
↓
ユーザーが `claude` を起動すると、AI が自律的にコーディング・テスト・デプロイまで完遂

このシステムは **GitHub で公開**しており、コードベースは**エンジニアでない筆者一人**が、Claude との対話を通じて v1 → v8 まで進化させてきました。

---

## なぜこれが「ただの prompt 集」ではないのか

LLM ベースのワークフロー設計には、はまりやすい 3 つの罠があります。

| 罠 | 起きること | pm-zero-claude の対処 |
|----|----------|---------------------|
| 確率的コンプライアンス | 「ルールを書けば守る」と期待するが、長セッションで Claude は指示を忘れる | **Hook（決定論的強制）** で、Claude が忘れても外部から振る舞いを強制する |
| コンテキスト管理崩壊 | プロジェクトが進むほど Claude の記憶があやしくなる | **External Memory Architecture** — state.md / decisions.md / issues.md を SSOT として LLM 外に置く |
| 設計時のハルシネーション | AI が「ある」と主張する機能が実は存在しない | **Phase 0.5 Pre-Design Verification Gate** — 設計案出力前に自己事実検査 |

これらは Anthropic 自身が 2026 年に **公式に問題として認めた**事項と同じ問題系です（cf. [2026-04-24 Anthropic Engineering Blog: Claude Code Quality Post-Mortem](https://claude.com/) ）。pm-zero-claude は、これらの問題が公式に認知される**以前から**、ユーザー側の設計で対処してきました。

---

## アーキテクチャ（v8.0：3 層モデル）

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: Policy（≤ 80 行）                            │
│   CLAUDE.md ─ 最小ルータ。詳細は @-imports で読み込み │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│ Layer 2: External Memory（永続 / SSOT）               │
│   vision.md  state.md  decisions.md  issues.md       │
│   escape.md  xp-rules.md                              │
│   ─ LLM のコンテキストウィンドウ外に置かれた記憶      │
│   ─ MIT RLM / Anthropic Managed Agents Memory と     │
│     収束する設計思想                                   │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────┐
│ Layer 3: Execution（決定論的強制 + 役割分業）         │
│   .claude/                                            │
│   ├─ settings.json   権限 + Hook 7 種                 │
│   ├─ rules/          globs: で選択ロード（Karpathy 等）│
│   ├─ agents/         Tier 1 × 5（PM 役割分業）         │
│   ├─ skills/         /resume /escape /audit etc.      │
│   └─ hooks/          .mjs（Node、Windows 互換）        │
└──────────────────────────────────────────────────────┘
```

3 つの層を分離した結果、**「ルールに従わない問題」「記憶を失う問題」「事実誤認の問題」**をそれぞれ独立に攻略できる構造になっています。

---

## ワークフロー（PM Phase）

```
[Phase 0: 事前リサーチ]      web_search で技術スタック・API・MCP の最新仕様確認
        │
[Phase 0.5: 自己検証]        架空機能・矛盾・バージョン依存の主張を自己検査
        │
[Phase 1: 4 段階インタビュー]  目的 → 範囲 → 振る舞い(Given/When/Then) → 制約
        │                    （1 ターン 3-5 問のバッチ質問でトークン削減）
        │
[Phase 2-A: コア 3 出力]      CLAUDE.md + vision.md + .env.example
        │
[Phase 2-B: 実行環境 3 出力]  settings.json + setup.bat + .mcp.json
        │
[Phase 2-C: 段階追加]         agents / skills / hooks / rules（必要に応じて）
        │
[ユーザー]                   フォルダ作成 → ファイル配置 → claude 起動
        │
[Claude Code]                自律実装・テスト・デプロイ
        │
[完了後 /ev]                  教訓抽出 → xp-rules.md → 次プロジェクトで再利用
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

## 実環境での動作

- **OS**: Windows 11
- **エディタ**: VS Code
- **ターミナル**: PowerShell 5.1 / 7
- **Claude Code**: v2.1.116 以上
- **Claude プラン**: Pro（$20/月）

---

## ファイル構成（リポジトリ）

```
pm-zero-claude/
├── pm-zero-claude-knowledge-v8.0.md  ← Claude.ai Project Knowledge にアップロード
├── README.md                          ← 本ファイル
├── xp-rules.md                        ← プロジェクト横断教訓
├── templates/                         ← v8.0 で生成される成果物テンプレート
│   ├── CLAUDE.md
│   ├── vision.md
│   ├── .env.example
│   ├── setup.bat
│   ├── .mcp.json
│   └── .claude/
│       ├── settings.json
│       ├── rules/
│       │   ├── karpathy.md
│       │   ├── coding-standards.md
│       │   └── testing.md
│       ├── agents/  (Tier 1 × 5)
│       ├── skills/  (必須 3)
│       └── hooks/   (7 種)
└── docs/
    ├── architecture.md
    ├── changelog.md
    └── design-decisions.md
```

---

## 使い方（要約）

1. このリポジトリを Claude.ai でプロジェクトとして作成
2. `pm-zero-claude-knowledge-v8.0.md` を Project Knowledge にアップロード
3. プロジェクトチャットで「○○ なアプリを作りたい」と入力
4. PM agent が Phase 0 〜 2 を実行、成果物パッケージを生成
5. ローカル環境にファイルを配置、`claude --permission-mode bypassPermissions` で起動
6. Claude Code が自律実装

---

## 哲学

**「AI に長文を覚えさせる」設計ではなく、「正しい情報を引く・正しい責務に振る・正しい検証を自動化する」設計に切り替える。**

LLM の能力は急速に向上しますが、**コンテキストウィンドウは増えてもコンテキスト管理の難しさは消えません**。MIT の Recursive Language Models (2026-01) や Anthropic の Managed Agents Memory (2026-04) が示唆するのは、**LLM 自身が記憶を持つのではなく、LLM の外側に永続記憶を置き、LLM はそれをプログラム的に操作する**という構造です。pm-zero-claude はこの構造を、Pro プランの制約下で再現可能に実装した一例です。

---

## ライセンス

MIT

## 作者

[snowtone-ai](https://github.com/snowtone-ai)

## 参考文献

- [Anthropic Claude Code Documentation](https://code.claude.com/docs)
- [Karpathy / Forrest Chang: andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
- [MIT CSAIL: Recursive Language Models (arXiv:2512.24601)](https://arxiv.org/abs/2512.24601)
- [Anthropic: Scaling Managed Agents (2026-04)](https://www.anthropic.com/engineering/managed-agents)
- [Anthropic Claude Code Post-Mortem (2026-04-24)](https://claude.com/blog/)
