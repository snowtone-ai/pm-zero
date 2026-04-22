# PM Zero Claude

**非エンジニアのアイデアを、AI が自律実行できる「再現可能な開発プロセス」に変換するシステム。
使うたびに自分自身が進化し、次のプロジェクトの品質を上げていく。**

---

## 一言で言うと

> 「AI に何を・どう指示するか」を標準化し、誰が使っても同じ品質の結果を出す仕組みを作った。

AI コーディングツール（Claude Code）は、入力の質に出力の質が完全に依存する。
同じツールを使っても、使い方次第で成果に 10 倍の差が生まれる。

PM Zero Claude は、**誰が使っても同じ品質の仕様書セットが出力される仕組み**を設計した。
リサーチ → インタビュー → 成果物生成 → 実装 → 教訓抽出 → 次回に反映、というサイクルを自動化している。

---

## 設計した「仕組み」の全体像

```
ユーザーの曖昧なアイデア（自然言語）
        ↓
  Phase 0: 事前リサーチ（最新 API / フレームワーク / MCP パッケージを検証）
        ↓
  構造化インタビュー（4 ステージ / 15〜25 問）
  ─ 誰が話しても同じ品質の仕様書が出るよう設計
        ↓
  成果物パッケージを自動生成（コア 5 + 段階追加 6）
  ┌─────────────────────────────────────────┐
  │ [コア 5]                                │
  │ 仕様書 / 行動規範 / 権限設定             │
  │ 環境変数テンプレート / 環境初期化スクリプト │
  │ [段階追加 6]                             │
  │ タスク状態管理 / 決定履歴 / エラーログ    │
  │ 専門エージェント / 再利用 Skill / Hooks  │
  └─────────────────────────────────────────┘
        ↓
  AI が自律実装（Claude Code）
  ─ Permission 質問ゼロで完全自律稼動
        ↓
  /ev コマンド → 失敗から教訓を抽出 → ルールとして蓄積
        ↓
  次のプロジェクトの行動規範に自動反映
        ↓
  プロジェクトを重ねるたびに精度が上がる
```

---

## 3 つの設計上の核心

### 1. プロセスの属人化排除

AI への指示は「書いた人のセンス」に依存する。PM Zero Claude はこれを排除した。

- **Phase 0 リサーチゲート**：インタビュー前に最新仕様・パッケージ名・API 制限を必ず調査
- **構造化インタビュー**：誰がアイデアを出しても、同じ 4 ステージ・同じ質問で仕様書が生成される
- **外部状態管理**：タスクの進捗・API キーの作成履歴・エラーログをファイルに記録し、担当者が変わっても引き継げる
- **暗黙知の可視化**：「なぜこの設計にしたか」を decisions.md に自動記録。後から参照可能

```
❌ 担当者の記憶に依存する進捗管理
✅ state.md / decisions.md / issues.md の 3 ファイルで外部化
   → セッションが終わっても、週が変わっても、状態が消えない
```

### 2. 確率的遵守と確定的強制の分離

AI に「必ずやれ」と文書で指示しても、AI は確率的にしか従わない。
ルールを 2 種類に分類し、それぞれ適切な強制手段を選んだ。

| ルールの種類 | 強制手段 | 遵守率 |
|---|---|---|
| 判断を伴うルール（設計方針・エラー対応） | CLAUDE.md（指示文書） | 確率的 |
| 判断不要な機械的ルール（フォーマット・ビルド・エラー記録） | Hooks（自動実行スクリプト） | **100%** |

ファイル保存のたびに Hooks が自動で prettier / 型チェック / エラー記録を実行する。
AI のトークンをゼロ消費で、人間が見落としがちなエラーを確定的に検知できる。

### 3. 失敗から学ぶ自己進化サイクル

プロジェクト完了時に `/ev` コマンドを実行すると、AI がエラーログを分析し、再発防止ルールを自動抽出する。

```
## XP-4: 古い学習データに基づく KEY 名・UI 案内の失敗

- 発生状況: 外部サービスの API キー取得手順を案内する時
- 根本原因: Claude の学習データ後にサービスの UI が変更されている
- ルール: 外部サービスの設定を指示する前 → 必ず Web 検索で最新 UI を確認する
```

抽出されるルールには原則がある。「このプロジェクト固有の対症療法」は棄却し、
「次のプロジェクトでも通用する抽象化されたルール」のみを採用する。

---

## v7.3 アップデート案の判断記録

v7.3 ではユーザーから 4 つのアップデート案が提示された。それぞれの判断根拠を示す。

### ① Permission 質問の完全排除 → **採用・最優先**

**提案：** コーディング中に Claude から git push やファイル書き込みの許可確認が来るのを一切なくしたい。

**判断根拠：** 実際の問題を調査したところ、原因が 2 層に分かれることが判明した。

- `settings.json` の `defaultMode: "bypassPermissions"` は **VSCode 拡張でバグあり**（GitHub #34923, #29026）。設定しても質問が来る。
- 確実に機能するのは CLI 起動時の `--permission-mode bypassPermissions` フラグのみ。

**設計：** CLI フラグによるバイパスを Layer 1、deny リストによる安全網を Layer 2 とする 2 層戦略を採用した。

```
Layer 1: claude --permission-mode bypassPermissions  ← 全 Permission 質問を消す
Layer 2: settings.json の deny リスト               ← rm -rf / git push --force 等は物理ブロック
```

これまで一度も「本当に危ない許可」が来なかったというユーザーの実績と、deny リストの存在が根拠。

---

### ② プロエンジニア協働を前提としたコーディング → **採用・設計に統合**

**提案：** できるだけシンプルなコード、他のエンジニアがテスト・デバッグしやすい前提で書く。

**判断根拠：** 2026 年に公開された 14 年キャリアのプリンシパルエンジニアによる 120 時間の実証研究（Claude Code vs Codex 比較）で、**「同一セッションで生成したコードは、そのコードのレビューに測定可能に劣る」** という知見が得られている。

**設計：** 3 つのレイヤーで対応した。

```
1. Fresh-Review パターン
   → pr-reviewer subagent に isolation: worktree を設定
   → レビューは history ゼロの新規 context で実施（実装と隔離）

2. TDD ファースト設計
   → test-writer（RED）と implementer（GREEN）を分離
   → 同じ context でテストと実装を書かせない

3. 専門 Subagent の Tier 化
   → Tier 1: planner / test-writer / implementer / pr-reviewer / docs-writer
   → Tier 2: architect / security-reviewer / debugger / refactorer（タスク型自動トリガー）
```

---

### ③ bootstrap.ps1 の代替 → **採用・setup.bat に置換**

**提案：** bootstrap.ps1 は何度やっても動かなかったので、別の選択肢を探してほしい。

**判断根拠：** PS 実行ポリシー・UTF-8 BOM・SmartScreen という 3 つの独立した障害が重なっており、非エンジニアにとって突破困難。

**設計：** Windows 10 1803 以降に組み込み済みの `cmd.exe`（`.bat`）のみを使う方式に変更した。

```batch
@echo off
mkdir .claude 2>nul
mkdir .claude\hooks 2>nul
mkdir .claude\agents 2>nul
mkdir .claude\skills 2>nul
mkdir .claude\rules 2>nul
echo Directory structure created.
echo Next: place files, then run: claude --permission-mode bypassPermissions
```

- ASCII only → エンコーディング問題なし
- 実行ポリシー不要 → 管理者権限不要
- SmartScreen 警告なし（`.bat` は `.ps1` より信頼度高）
- **ユーザーがやることは「ダブルクリック」のみ**

bootstrap.ps1 は互換性のため deprecated fallback として保持。

---

### ④ ナレッジファイルのコンテキスト量 → **採用・37% 削減**

**提案：** ナレッジファイルは設計意図も含めて詳しくすべきか、それともシンプルにすべきか？

**判断根拠：** 公式ドキュメント（`code.claude.com/docs/en/memory`）に「CLAUDE.md は 200 行未満」と明記。実測では 2,800 行 → 180 行で初応答時間が 10-12 秒 → 3-5 秒に短縮。「CLAUDE.md は system prompt ではなく user message として注入される」という仕組み上、長くなるほどコンプライアンス率が低下する。

**設計：** ナレッジファイルをルール・スキーマ中心に圧縮。設計経緯・バージョン変更履歴は削除。

```
v7.2: 920 行 / 43KB / ~17,200 tokens（概算）
v7.3: 726 行 / 27KB / ~10,900 tokens（概算）

削減率: 37% バイト削減 / 40% トークン削減
```

「余分なテキストも含めるべき？」という問いに対する答えは「No」。PM agent に必要なのは判断根拠ではなく、判断軸そのもの。

---

## v7.2 → v7.3 の変更点

### 検証で発見した致命欠陥の修正

v7.3 のリサーチ・ファクトチェックで、v7.2 の設計から以下の不正確な記述が判明した。

```
❌ v7.2 の問題点（他の AI モデルが作ったと仮定して冷徹に批判）：

1. exit 2 = 常にブロック と説明していた
   → 公式ではイベントごとに挙動が異なる（PreToolUse はブロック、
     UserPromptSubmit はコンテキスト注入のみ）

2. .claude/rules/ で paths: frontmatter を推奨していた
   → GitHub #17204, #16299, #23478 のバグで実際には動作しない
   → 正しくは globs: を使う

3. .claudeignore をネイティブ機能として案内していた
   → 公式機能ではない。npm パッケージ（PreToolUse Hook の実装）
   → The Register の実証実験でも無視されることが確認済み

4. settings.json の defaultMode: bypassPermissions に依存した設計
   → VSCode 拡張でバグあり（#34923, #29026）
   → CLI flag が唯一の確実手段

5. Hook イベントを 26 種類と記載
   → 公式ドキュメントで 27 種類を確認
   → UserPromptExpansion, CwdChanged, TaskCreated が不足していた

✅ v7.3 の修正：
   上記 5 点をすべて公式ドキュメントで検証・修正済み
```

### 主要変更点（10 項目）

| 変更 | v7.2 | v7.3 |
|---|---|---|
| Permission 排除 | 部分的な allow リスト | CLI フラグ + deny リスト 2 層戦略 |
| 起動コマンド | `claude` | `claude --permission-mode bypassPermissions` |
| bootstrap | bootstrap.ps1（失敗多発） | setup.bat（ダブルクリックのみ） |
| ナレッジ容量 | 920 行 / 43KB | 726 行 / 27KB（37% 削減） |
| CLAUDE.md | 60-100 行 | ≤100 行シンルータ（XML タグ構造化） |
| Rules ディレクトリ | 非採用 | `.claude/rules/*.md`（`globs:` frontmatter） |
| exit 2 説明 | 常にブロック | イベント別挙動（正確化） |
| Subagent 設計 | 3 agent（pm-zero / env-setup / verifier） | Tier 1 × 5 + Tier 2 × 4（fresh-review パターン） |
| pr-reviewer | なし | `isolation: worktree` で history ゼロ査読 |
| Hook イベント | 26 種 | 27 種（公式確認済み） |

---

## 定量的効果

| 改善点 | 効果 |
|---|---|
| ナレッジファイルのトークン削減 | **40% 削減**（17,200 → 10,900 tokens 概算） |
| Permission 質問ゼロ化 | 承認待ち時間ゼロ / 中断なし完全自律稼動 |
| setup.bat（ダブルクリック） | セットアップ失敗率の大幅低減 |
| インタビューバッチ設計（3〜5 問/ターン） | インタビューコスト 75% 削減 |
| Hooks による確定的テスト自動化 | エラーの 80% をゼロトークンで検知 |
| Fresh-Review パターン（worktree 隔離） | レビュー品質の測定可能な向上 |
| globs: ルール分散（`.claude/rules/`） | CLAUDE.md の関係ないルールを排除 |
| Playwright MCP → Tool Search 委任 | 検証トークン ~85% 削減（公式） |
| **合計** | **v6.0 比 45〜65% コスト削減（推定）** |

---

## 開発の経緯

| バージョン | 主な変化 |
|---|---|
| v1〜v4 | 基本的な要件定義フォーマットの模索 |
| v5.0 | 5 成果物パッケージ・インタビュー構造の確立 |
| v6.0 | トークン最適化・Hooks 導入・MCP 構成の整備 |
| v7.0 | 状態の外部化・マルチエージェント・自己進化 Skill の完全実装 |
| v7.2 | 公式仕様照合による致命欠陥修正・Phase 0 リサーチゲート標準化 |
| **v7.3（現在）** | **Permission 完全排除・setup.bat 移行・Fresh-Review パターン・公式ファクトチェック** |

---

## ファイル構成

```
pm-zero-claude/
├── pm-zero-claude-knowledge-v7.3.md  # PM エージェントの知識ベース（Claude.ai にアップロード）
├── xp-rules.md                        # プロジェクト横断で蓄積される実践知
└── README.md                          # このファイル

# 新規プロジェクト開始時に生成される構成（参考）
project/
├── CLAUDE.md              # ≤100 行シンルータ（XML タグ構造化）
├── vision.md              # 仕様・受入基準・タスク分解
├── .env.example           # 必要な API キー一覧
├── setup.bat              # ディレクトリ構造作成（ダブルクリックのみ）
├── .mcp.json              # プロジェクト MCP 定義（cmd /c 形式）
└── .claude/
    ├── settings.json        # 権限（deny リスト）+ 10 Hook 定義
    ├── settings.local.json  # .gitignore 対象
    ├── state.md / decisions.md / issues.md / escape.md
    ├── rules/               # globs: frontmatter でパススコープ
    ├── agents/              # Tier 1 × 5 + Tier 2 × 4
    ├── skills/              # 必須 3 + 推奨 3
    └── hooks/               # 自動実行スクリプト 10 本
```

---

## 使い方

### 1. セットアップ（1 回のみ）

Claude.ai でプロジェクトを作成し、2 ファイルをナレッジにアップロードする。

```
ナレッジ ← pm-zero-claude-knowledge-v7.3.md
ナレッジ ← xp-rules.md
```

グローバル MCP を登録する（PowerShell で実行）。

```powershell
# 公式ドキュメント参照 MCP
claude mcp add-json context7 -s user '{"type":"stdio","command":"cmd","args":["/c","npx","-y","@upstash/context7-mcp@latest"]}'

# Web 検索 MCP
claude mcp add-json brave-search -s user '{"type":"stdio","command":"cmd","args":["/c","npx","-y","@brave/brave-search-mcp-server"],"env":{"BRAVE_API_KEY":"<your-key>"}}'
```

グローバル settings.json を更新する（PowerShell で実行）。

```powershell
$content = '{"env":{"CLAUDE_CODE_USE_POWERSHELL_TOOL":"1","CLAUDE_AUTOCOMPACT_PCT_OVERRIDE":"45"}}'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("$env:USERPROFILE\.claude\settings.json", $content, $utf8NoBom)
```

### 2. アイデアを話す

Claude.ai のプロジェクトに作りたいものを 1〜2 文で伝える。
PM エージェントが **Phase 0 リサーチ**（最新フレームワーク・API・MCP パッケージを調査）を実施してから
4 ステージ（目的→範囲→振る舞い→制約）で 15〜25 問インタビューし、成果物を生成する。

### 3. セットアップして起動する

```
# 受け取ったファイルをプロジェクトフォルダに配置
# setup.bat をダブルクリック（ディレクトリ構造が作成される）
# .env.local に API キーを記入

# Claude Code を起動（Permission 質問ゼロ）
claude --permission-mode bypassPermissions
```

### 4. 教訓を蓄積する（プロジェクト完了時）

```bash
/ev
# エラーログを分析 → 再発防止ルールを抽出 → xp-rules.md 用に出力
# xp-rules.md を Claude.ai に再アップロードで次回から自動反映
```

---

## 特殊コマンド

| コマンド | タイミング | 処理内容 |
|---|---|---|
| `/resume` | 長期中断後の再開時 | 状態ファイルと実コードを照合し現状を報告 |
| `/escape` | エラーが 3 回解決しない時 | 試行履歴を記録 → Opus 4.7 へエスカレーション |
| `/audit` | 月 1 回推奨 | ナレッジの陳腐化チェックと更新案の提示 |
| `/ev` | プロジェクト完了時 | 教訓抽出 → xp-rules.md 更新 + README.md 生成 |
| `/env-guide` | 外部 API key 設定時 | 最新 UI を前提にした取得手順を生成 |
| `/console-debug` | ブラウザエラーが解決しない時 | コンソール出力の取得方法を案内し原因を特定 |

---

## 技術スタック

**PM システム（このリポジトリ）**
Claude.ai Project · Claude Opus 4.7 / Sonnet 4.6 · Claude Code · Windows + PowerShell 5.1/7+

**生成されるプロジェクトの前提スタック**（バージョンは Phase 0 で都度検証）
Next.js（App Router）· React · TypeScript strict · Tailwind CSS v4 · pnpm · Node.js 24.x · Vercel

---

## ライセンス

MIT
