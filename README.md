<div align="center">

```
██████╗ ███╗   ███╗      ███████╗███████╗██████╗  ██████╗
██╔══██╗████╗ ████║      ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗
██████╔╝██╔████╔██║        ███╔╝ █████╗  ██████╔╝██║   ██║
██╔═══╝ ██║╚██╔╝██║       ███╔╝  ██╔══╝  ██╔══██╗██║   ██║
██║     ██║ ╚═╝ ██║      ███████╗███████╗██║  ██║╚██████╔╝
╚═╝     ╚═╝     ╚═╝      ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝
                                                       v10
```

**Autonomous Solo-Dev OS — Claude Code × Windows PowerShell**

[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Claude Code](https://img.shields.io/badge/runtime-Claude%20Code%20only-orange?style=flat-square&logo=anthropic)](https://code.claude.com)
[![Platform](https://img.shields.io/badge/platform-Windows%20PowerShell-blue?style=flat-square&logo=powershell)](https://learn.microsoft.com/powershell)
[![Version](https://img.shields.io/badge/version-v10-green?style=flat-square)]()
[![RTK](https://img.shields.io/badge/token%20saving-60--90%25-brightgreen?style=flat-square)](https://github.com/rtk-ai/rtk)

</div>

---

> **エンジニアでなくても、世界トップクラスのエンジニアと同じプロセスでソフトウェアを出荷できる。**  
> 1つのClaude Codeエージェントが、設計から実装・レビュー・git・学習までを完全自動で実行する。

---

## これは何か

**pm-zero v10** は、Claude Code を使ったソロ開発を完全自律化するための **OSレベルのルールセット** です。

コードを1行も書かなくていい。レビューしなくていい。git操作も自動。

Claude Codeエージェントが自分で考え、自分でレビューし、自分でGitHubにプッシュし、**失敗から学習して次回は同じミスをしない。**

```
あなた:「ログイン機能を実装して」

pm-zero v10:
  ✓ コードベースを調査（Haiku）
  ✓ 実装（Sonnet）
  ✓ テスト作成・実行（Sonnet）
  ✓ セキュリティ自己レビュー（Opus — 人間の代わり）
  ✓ commit → push → PR → merge
  ✓ 完了報告（日本語）
  ✓ 失敗があればルールに昇格して次回に活かす
```

---

## Before / After

| | Before（v9.5以前） | **After（pm-zero v10）** |
|---|---|---|
| レビュー | 人間が必要 | 別モデルのサブエージェントが代替 |
| ツール追加 | 都度承認プロンプト | 自動承認（危険操作のみブロック） |
| コンテキスト消失 | 作業が途切れる | ファイルが記憶。会話は使い捨て |
| 同じミスの繰り返し | 防げない | 自己進化ループが恒久ルールに昇格 |
| トークン消費 | 無制限・無計画 | RTKで60–90%削減 ＋ モデル自動選択 |
| gitワークフロー | 手動 | branch→commit→push→PR→merge 完全自動 |

---

## 特徴

**🧠 人間レビューなしの完全自動実装**  
設計→実装→自己レビュー（Opus）→verify→commit→merge が無停止で走る。  
人間が関与するのは「実際のお金が動く操作」だけ。

**🔄 自己進化システム（XPシステム廃止）**  
同じエラーが3回起きると、自動でWeb検索 → 根本原因の特定 → `CLAUDE.md` に恒久ルールとして昇格。  
次のセッションから同じミスは起きない。

**⚡ トークン消費の徹底最適化**  
RTK（Rust Token Killer）が全CLIコマンドを透過的にフィルタリング（実測：cargo test 98%削減、git status 76%削減）。  
CLAUDE.mdはルックアップ表として設計。詳細は必要時のみオンデマンドロード。

**🛡️ 40–50%でのauto-compact前提設計**  
コンテキストは50%で圧縮される前提。クリティカルな事実はすべてファイルに永続化。  
会話履歴が消えてもプロジェクトは止まらない。

**🔌 MCPツール追加も許可不要**  
新しいMCPサーバーを接続しても、安全な操作は自動で実行。  
危険な操作（シークレット読み取り・force push・DB破壊操作）だけをPreToolUseフックでブロック。

**🤖 モデルを自動でコスト最適に選択**  
| 用途 | モデル |
|---|---|
| アーキテクチャ・自己レビュー | Opus 4.8 |
| 実装・リファクタ・テスト | Sonnet 4.6 |
| 探索・ファイル読み取り | Haiku 4.5 |

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    pm-zero v10 の構造                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  あなた（非エンジニア）                                        │
│      │  「〜を実装して」                                       │
│      ▼                                                      │
│  ┌──────────────────────────────────────────┐               │
│  │        Main Claude Code Agent            │               │
│  │     （Sonnet 4.6 / Opus 4.8）            │               │
│  │                                          │               │
│  │  CLAUDE.md を毎ターン読み込み             │               │
│  │  tasks.md → state.md を管理              │               │
│  │  サブエージェント配分を自動決定           │               │
│  └────┬─────────────┬──────────────┬────────┘               │
│       │             │              │                        │
│       ▼             ▼              ▼                        │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐                │
│  │ Explore │ │Implement │ │ Self-Review   │                │
│  │ (Haiku) │ │(Sonnet)  │ │ (Opus / fresh │                │
│  │ 独立ctx  │ │ 独立ctx  │ │  context)     │                │
│  └─────────┘ └──────────┘ └───────────────┘                │
│       │             │              │                        │
│       └──────┬───────┘              │                       │
│              │   要約のみ戻す        │  pass/fail            │
│              ▼                      ▼                       │
│  ┌───────────────────────────────────────────────────┐      │
│  │  Continuity Layer（ファイルが記憶）                │      │
│  │  tasks.md / state.md / decisions.md / issues.md  │      │
│  │  → commit → push → PR → auto-merge               │      │
│  └───────────────────────────────────────────────────┘      │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────────────────────────┐               │
│  │  Self-Evolution Loop                    │               │
│  │  失敗 → issues.md → Web検索 →           │               │
│  │  根本原因 → CLAUDE.md にルール昇格        │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## クイックスタート

> 前提: Claude Code、Node.js、pnpm、Git、ripgrep がインストール済みであること。

### Step 1 — テンプレートをコピー

```powershell
# このリポジトリをクローン、またはテンプレートとして使用
git clone https://github.com/yourname/pm-zero-v10.git my-project
cd my-project
```

### Step 2 — RTKを有効化（初回のみ・全プロジェクト共通）

```powershell
# RTKがインストール済みの場合、グローバルフックを1回設定するだけ
rtk init -g
```

### Step 3 — 設定を確認

```powershell
# ツールチェーンの確認
claude --version && node --version && pnpm --version && rtk --version

# .claude/settings.json を確認（権限・auto-compact設定済み）
cat .claude/settings.json
```

### Step 4 — プロジェクトを伝える

Claude Code を起動して、以下のように話しかけるだけ：

```
「〇〇というアプリを作りたい。ユーザーは〜で、目的は〜」
```

pm-zero v10 の PM Interview プロセスが自動で動き、`docs/vision.md` と `tasks.md` を生成します。

### Step 5 — あとは任せる

```
「では実装を開始して」
```

以降はエージェントが自律実行します。完了時に日本語でハンドオフレポートが届きます。

---

## ファイル構成（デフォルト13ファイル）

```
my-project/
│
├── CLAUDE.md                    ← 主指令。毎ターン読み込み。lean設計
├── .claude/
│   └── settings.json            ← 権限・auto-compact・guard hook
│
├── docs/
│   ├── vision.md                ← プロダクトの北極星
│   ├── state.md                 ← 現在の実行ポインタ
│   ├── decisions.md             ← 永続的な意思決定ログ
│   ├── issues.md                ← 失敗ログ → 自己進化の燃料
│   └── repo-map.md              ← ナビゲーションマップ
│
├── tasks.md                     ← 唯一の実行台帳
│
├── scripts/
│   ├── setup.mjs                ← セットアップヘルパー
│   └── verify.mjs               ← 統合検証エントリポイント
│
├── HANDOFF-JA.md                ← 完了・エラー報告テンプレート（日本語）
├── .env.example                 ← 環境変数テンプレート
└── .gitignore
```

---

## 品質の定義

13のゲートで構成。コードレビューを自動化した上でも品質を保証する。

| 優先度 | ゲート | 自動化方法 |
|---|---|---|
| Correctness | Q1 | 受け入れ基準 + tests |
| Security | Q9 | Opusによる自己レビュー必須 |
| Reliability | Q8 | エラーハンドリング + 3回失敗→Web検索 |
| Data Integrity | Q10 | マイグレーションの可逆性確認 |
| Observability | Q11 | 構造化ログ + トレーサビリティ |
| Maintainability | Q4 | 300行/ファイル・50行/関数上限 |
| Performance | Q6 | ホットパス最適化・レイテンシ確認 |
| Scalability | Q5 | スケーリングボトルネックの排除 |
| Testability | Q7 | テスト必須・依存注入可能な設計 |
| Dependency Security | Q12 | ロックファイル + 脆弱性スキャン |

---

## 自己進化の仕組み

pm-zero v10 が同じミスを繰り返さない理由：

```
エラー発生
    │
    ▼
docs/issues.md に記録
    │
    ├─ 修正して再試行
    │
    ├─ 3回同じ失敗 → Web検索で解決策を探す
    │                  └ 出典URLをissues.mdに記録
    │
    └─ 根本原因を特定
         │
         ├─ 常時適用ルール → CLAUDE.md に1行追加
         │                   （次セッションから自動適用）
         │
         └─ 参照レベルの教訓 → docs/lessons.md
```

---

## v10 が解決する問題

| 問題 | 原因 | v10の解決策 |
|---|---|---|
| コンテキスト圧縮で作業が途切れる | 重要な事実がチャット履歴にしか存在しない | 論理単位ごとにファイルへチェックポイント + コミット |
| 同じバグが何度も出る | 恒久的な学習の仕組みがない | 自己進化ループ → CLAUDE.md に昇格 |
| ツール追加のたびに許可が必要 | 都度承認モデル | allow-by-default + 危険操作のみdeny hook |
| レビューに人間が必要 | 自動レビューの仕組みがない | 新規Opusサブエージェント（実装コンテキストなし）が代替 |
| トークンが足りない | 無計画な消費 | RTK + CLAUDE.md lean + サブエージェント分離 |

---

## v9.5 からの変更点

| 項目 | v9.5 | v10 |
|---|---|---|
| アーキテクチャ | Agent OS（CEO → CodeX） | Autonomous Solo-Dev OS（1エージェント） |
| ランタイム | Claude + Codex CLI | Claude Code のみ |
| レビュー | クロスベンダー / 人間 | クロスモデル自己レビュー |
| 学習システム | xp-rules.md へのXP昇格 | リポジトリ内自己進化ループ |
| コンテキスト | 圧縮を前提としていない | 40–50%でauto-compact前提 |
| トークン戦略 | 節約が目標 | 最優先の設計制約 |

---

## よくある質問

**Q. エンジニアでなくても使えますか？**  
A. はい。VSCode と Claude Code のインストールができる方であれば使えます。pm-zero の設計思想が「非エンジニアが運用できること」です。

**Q. 本当に人間レビューなしで安全ですか？**  
A. コードレビューは自動化（Opus自己レビュー + 決定論的ゲート）されます。ただし「実際のお金が動く」「本番クレデンシャルを使う」「個人情報を公開する」の3種類だけは人間ゲートが残ります。コード承認ではなく、現実世界の不可逆操作が判断基準です。

**Q. Claude Pro プランで動きますか？**  
A. 動きます。CLAUDE.mdのlean設計・RTKによるトークン削減・早期auto-compact・Haiku優先の探索により、Proプランの5時間ウィンドウを効率的に使う設計です。

**Q. tasks.md に書いてないアドホック作業は？**  
A. 問題ありません。エラー修正や即席の修正は tasks.md なしで、自動ルーティングルールに従ってメインコンテキスト（Sonnet）で直接処理されます。

**Q. MCP サーバーを後から追加したらどうなりますか？**  
A. 安全なツール呼び出しは自動承認されます。接続のたびに人間が許可する必要はありません。

---

## 設計思想

> *「会話は使い捨て、ファイルが記憶。」*

1. **ファイルシステムが唯一の真実の源泉** — チャット履歴が消えてもプロジェクトは続く
2. **エラーは欠けているルールのシグナル** — 失敗を罰するのではなく、ルールに変換する
3. **トークンはリソース、無計画に使わない** — Proプランでも持続可能に設計
4. **自律性はセキュリティと両立できる** — allow-by-default + deny-only dangerous set
5. **「人間レビューなし」≠「レビューなし」** — 自動化したレビューは人間より速く、盲点が少ない

---

## ライセンス

MIT — 自由に使用・改変・再配布できます。

---

<div align="center">

**pm-zero v10 で、あなたの開発を自律化してください。**

[![Star this repo](https://img.shields.io/badge/⭐-Star%20this%20repo-yellow?style=for-the-badge)](.)
[![Use this template](https://img.shields.io/badge/📋-Use%20this%20template-green?style=for-the-badge)](.)

*Built for Claude Code. Designed for humans.*

</div>
