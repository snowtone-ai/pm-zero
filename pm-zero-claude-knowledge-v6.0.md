# pm-zero-claude — ナレッジシート v6.0

用途：Claude.ai プロジェクトの「Knowledge」にアップロードする。
機能：ユーザーの曖昧なアイデアを、Claude Codeが自律実行できる
5成果物（CLAUDE.md / vision.md / settings.json / MCP初期化コマンド / issues.md）に変換する。

v5.0 → v6.0 変更点：
- トークン最適化アーキテクチャ統合 — ツール積層ではなく設計レベルで70-90%コスト削減
- インタビュー設計を「1ターン最大3問」→「1ターン3-5問」に拡張（研究根拠：75%コスト削減）
- フェーズ間圧縮の導入 — 各Stage完了時に構造化要約を生成し、rawな会話履歴を破棄
- 3層検証アーキテクチャ — Hooks自動テスト(Tier1) → playwright-slim(Tier2) → ユーザー目視(Tier3)
- Playwright MCP → playwright-slim 切替（トークン73%削減、ユーザー手順変更なし）
- Hooks大幅強化 — PostToolUseでbuild/lint自動実行（AIトークンゼロの品質ゲート）
- コンテキスト階層設計をCLAUDE.md生成原則に導入
- CLAUDE.md「progressive disclosure」原則 — 全情報埋め込みからファイル参照方式へ
- 品質チェックリスト 19→21 項目

---

## [A] 物理的制約

A-1. コンテキスト200K（標準）/ 1M（拡張・GA・追加料金なし）。命令遵守の実効上限は約200命令。
A-2. CLAUDE.md 200行以内。30-100行が最高効率帯。1行追加で全命令の遵守率が均一低下。
A-3. MCPサーバーのトークン消費：Tool Search有効時、未使用ツールは自動遅延ロード（最大85%削減）。同時アクティブツール10-15個以下を推奨。
A-4. コンテキスト使用率40%が最高品質帯。60%で注意力低下。75-92%でコンパクション自動発動。90%で幻覚急増。
A-5. ロジックエラー率は人間の1.75倍。検証なき完了宣言は信頼できない。LLM自己評価のエラー検知率は64.5%。
A-6. 具体仕様→1-2ラウンド。曖昧仕様→5-8ラウンド。原子的タスク分割→コスト58%削減。
A-7. CLAUDE.mdはシステムプロンプトではなく、`<system-reminder>`タグとしてユーザーメッセージに注入される（isMeta: true）。Claudeは「関連性なし」と判断して無視し得る。非普遍的な指示が多いほど無視リスクが上昇する。
A-8. 100%遵守が必要なルールはCLAUDE.md（確率的）ではなくHooks（確定的）で強制する。
A-9. Skills はディレクトリベースの能力パッケージ。起動時コストゼロ（名前+説明のみロード）。MCP代替として検討する。

### A-10. トークンコスト構造（v6.0新設）
- 10ターン会話は1ターンの55倍コスト（履歴再送による二次関数的膨張）
- Claude Codeセッションの初期消費：57K-145Kトークン（システムプロンプト3.1K + 内蔵ツール12.4K + 予約バッファ33-45K + MCPツール5.7-82K）
- Playwright MCP単体で約13.6Kトークン消費。playwright-slimで73%削減（約3.6K）
- Playwright MCPの1テスト実行：89-114Kトークン。Playwright CLIなら約27Kトークン（3.7倍効率）
- outputトークンはコスト全体の少数派。inputトークン（履歴・ファイル読取・ツールスキーマ）が支配的
- プロンプトキャッシュ：自動適用。キャッシュ読取は基本料金の0.1倍（90%削減）。キャッシュヒット率96%

---

## [B] CLAUDE.md に埋め込む必須ルール（全項目。重複なし）

PMはこのセクションの全項目をCLAUDE.mdに反映する。
「ここにないルールはCLAUDE.mdに書かない」が原則。
xp-rules.md が存在する場合、その内容をB-8の直前に挿入する。

### CLAUDE.md設計原則（v6.0新設）
- **progressive disclosure**: 全情報をCLAUDE.mdに埋め込まない。「vision.mdを参照」「Context7で確認」のようにファイル参照・ツール参照で情報アクセス方法を示す。
- **コンテキスト階層**: ルールを重要度順に配置する。最重要ルールを先頭と末尾に、中間には頻度の高い実行ルールを置く（attention mechanismの特性：先頭と末尾が最も遵守される）。
- **確定的 vs 確率的の分離**: 100%遵守が必要なルール（prettier適用、ビルド確認、lint通過）はHooksで強制し、CLAUDE.mdには書かない。CLAUDE.mdには判断を伴うルールのみ書く。

### B-1. 技術スタック宣言
Next.js 16+ (App Router) / React 19 / TypeScript (strict: true) / Tailwind CSS v4 / pnpm / Vercel

### B-2. 地雷回避ルール（トリガー→アクション形式）
- Tailwind のスタイル設定時 → globals.css の @theme で定義する。tailwind.config.ts は作らない（v4でCSS-First Configurationに移行済み）
- globals.css の先頭 → `@import "tailwindcss"` の1行にする。@tailwind base/components/utilities は使わない
- postcss.config に postcss-import や autoprefixer を書かない → Tailwind v4 が内部処理する（Lightning CSS統合済み）
- ページコンポーネントで params/searchParams を使う時 → 必ず await で非同期アクセスする（Next.js 16で同期アクセスは完全削除済み）
- cookies() / headers() / draftMode() を使う時 → 必ず await する（Next.js 16で同期アクセスは完全削除済み）
- middleware を使う時 → ファイル名は proxy.ts、エクスポート関数名も proxy にする（Next.js 16で middleware.ts は廃止）
- パッケージの依存関係エラー時 → --force ではなく pnpm を使う
- Vercel にデプロイする前 → npx tsc --noEmit と pnpm lint と pnpm build をローカルで実行する
- Server Component をデフォルトにする。"use client" は状態管理やブラウザAPIが必要な時だけ追加し、コンポーネントツリーの末端（リーフ）に配置する
- ブラウザ専用API（IndexedDB / localStorage / Web Speech API等）を使うコンポーネントをpage.tsxから呼ぶ時 → page.tsx自体に"use client"を付け、dynamic(() => import(...), { ssr: false })でSSRを無効化する
- layout.tsx で <html> タグを書く時 → suppressHydrationWarning 属性を必ず付ける

### B-3. 知識同期ルール（Context7 MCP）
- Next.js / React / Tailwind / shadcn/ui / Supabase / Prisma のAPIを使う時 → 必ず Context7 MCP で公式ドキュメントを確認してから実装する。推測で実装しない。例外なし

### B-3b. Web調査ルール（Brave Search MCP）
- エラーの解決策を調べる時 → Brave Search MCP で最新の情報を検索する
- ライブラリの選定・比較を行う時 → Brave Search MCP で現在の評価・互換性を確認する

### B-3c. 外部サービス事前調査ルール
- 外部API・サービス・AIモデルを使う時 → 実装前に Brave Search MCP で以下を必ず確認する：
  (1) 現在の最新バージョン/モデル名（古いバージョンを使わない）
  (2) 無料枠の制限（RPM / TPM / 日次クォータ / 月次クォータ）
  (3) 料金体系（従量課金の単価、無料枠超過時の挙動）
  (4) レート制限の回避策（バックオフ、バッチ処理、キュー）
- 調査結果を vision.md の制約セクション（または該当タスクのコメント）に記録する
- 「たぶんこのモデル/バージョンで大丈夫」は禁止。確認してから使う

### B-4. 3層検証アーキテクチャ（v6.0刷新）

#### Tier 1: 確定的テスト（Hooks自動実行・AIトークンゼロ）
- ファイル保存時 → Hooksが自動で `pnpm build --no-lint` と `pnpm lint` を実行する
- テストファイルが存在する場合 → Hooksが自動で `pnpm test --run` を実行する
- この層はCLAUDE.mdに書かない（Hooksが確定的に実行する）

#### Tier 2: playwright-slim による自動検証
- UI機能の実装後 → playwright-slim でブラウザ上の動作を検証する
- 1回の検証は10ステップ以内に制限する（トークン膨張防止）
- 検証結果から再利用可能なPlaywrightテストファイルを生成する（次回以降Tier 1に昇格）

#### Tier 3: ユーザー目視確認（最終ゲート）
- Tier 1/2の通過後 → ユーザーに「ブラウザで http://localhost:3000/[パス] を開き、[具体的に何が見えるか] を確認してください」と指示する
- AIの自己申告だけで完了としない
- 機能実装後 → vision.md の Acceptance Criteria の各項目について合否を1行ずつ報告する

### B-5. エラーループ脱出ルール
- 同じエラーを2回修正して直らない時 → 修正を止めて以下を実行する：
  (1) 根本原因の仮説を述べる
  (2) 試した修正とその結果を列挙する
  (3) 解決に不足している情報を特定する
  (4) ユーザーに判断を仰ぐ

### B-5b. エラー自動記録ルール
- エラーが発生した時 → issues.md に以下を追記する：
  日時、タスク名、エラー内容、試した修正、結果（解決/未解決）
- 手戻りが発生した時 → issues.md に原因と対処を追記する
- issues.md は /ev コマンド時に教訓抽出の入力として使う

### B-6. 3層境界
- ✅ Always: テスト実行、lint通過確認、動作確認コミット、Plan Mode でのタスク開始
- ⚠️ Ask first: 新規依存の追加、DB/APIスキーマ変更
- 🚫 Never: .env のコミット、node_modules 編集、失敗テストの削除

### B-7. コンテキスト管理
- /compact 時は変更ファイル一覧と現在のタスク状況を必ず保持する
- 3タスク完了ごと、または30分経過時 → /context でトークン使用率を確認しユーザーに報告する
- コンテキスト使用率50%超過時 → 即座に /compact を実行する（v6.0: 閾値を60%→50%に引き下げ。品質劣化の予防的管理）

### B-7b. Git自動化ルール
- 各タスク完了時 → git add . と git commit -m "[タスク名]: [変更内容の要約]" を実行する
- 全タスク完了時 → ユーザーに GitHub プッシュ手順を提示する（後述のハンドオフ参照）

### B-8. 自己改善
- 間違えた時 → このファイルにルールを追加して再発防止する（最終行に記載）

### B-9. 書かないもの
コードスタイル（インデント、命名規則、セミコロン等）はリンターの仕事。CLAUDE.mdには書かない。
確定的に強制するルール（prettier、build確認、lint）もCLAUDE.mdには書かない。Hooksの仕事。

---

## [C] MCP 構成（3サーバー）

### C-1. Context7（必須・グローバル・事前導入済み）
インストール：claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
APIキー不要。無料（基本レート制限あり）。ユーザーが事前にグローバル導入済み。
CLAUDE.md記述：B-3 を参照。

### C-2. playwright-slim（必須・プロジェクト単位・毎回導入）（v6.0変更）
インストール：claude mcp add playwright -s project -- npx -y @anthropic-ai/playwright-slim@latest
CLAUDE.md記述：B-4 を参照。
トークン消費：公式Playwright MCPの約27%（73%削減）。スキーマサイズ約3.6K（公式13.6K比）。
※公式Playwright MCP（@playwright/mcp）からの切替。機能は同等、トークン効率が大幅に改善。
フォールバック：playwright-slimが利用不可の場合は `claude mcp add playwright -s project -- npx -y @playwright/mcp@latest` を使用。

### C-3. Brave Search（必須・グローバル・事前導入済み）
インストール：claude mcp add brave-search -s user -e BRAVE_API_KEY=your-key -- npx -y @brave/brave-search-mcp-server
※旧パッケージ `@modelcontextprotocol/server-brave-search` は非推奨・廃止。v2に移行済み。
無料枠：月$5クレジット（約1,000クエリ/月）。ユーザーが事前にグローバル導入済み。
CLAUDE.md記述：B-3b, B-3c を参照。

### C-4. トークン最適化の原則
- MCP Tool Search（Claude Code内蔵・デフォルト有効）が自動で未使用ツール定義を遅延ロードする（最大85%削減）
- MCP説明文は英語で記述する（日本語比で約50%トークン削減）
- 同時アクティブツールは10-15個以下に保つ
- MCPで重い処理はCLI + Skillsでの代替を検討する（MCP 13K-18K → CLI 約225トークン）
- playwright-slimを標準採用し、公式Playwright MCPは必要な場合のみフォールバックとして使用

### C-5. 不要なもの（削除済み）
Filesystem MCP / GitHub MCP / Sequential Thinking MCP / Memory MCP / コスト監視MCP → 全て内蔵ツールで代替可能。

---

## [D] settings.json 仕様

### 権限評価順序
deny → ask → allow（最初にマッチしたルールが適用。denyは常に最優先）。

### 必須 deny（固定。変更不可）
```
Read(./.env), Read(./.env.*), Read(./.env.local), Read(./.env.production),
Read(**/.env), Read(**/.env.*),
Bash(rm -rf *), Bash(sudo *), Bash(curl *), Bash(wget *), Bash(ssh *),
Bash(git push --force *), Bash(git push -f *)
```

### 必須 allow（固定。変更不可）
```
Read, Glob, Grep, LS, WebFetch, WebSearch,
Write(src/**), Edit(src/**),
Write(public/**), Edit(public/**),
Write(./issues.md), Edit(./issues.md),
Write(./CLAUDE.md), Edit(./CLAUDE.md)
```

### 動的 allow（プロジェクトごとにPMが生成）
パッケージマネージャに対応した dev/build/lint/test コマンド。
git status, git diff *, git log *, git add *, git commit *。
プロジェクト固有CLIツール。

### Hooks（確定的ルール強制・v6.0大幅強化）
settings.json 内の hooks キーで設定する。以下はPMが生成するデフォルトHooks：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path // empty'); if [ -n \"$FILE\" ] && echo \"$FILE\" | grep -qE '\\.(ts|tsx|js|jsx)$'; then npx prettier --write \"$FILE\" 2>/dev/null; fi"
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path // empty'); if [ -n \"$FILE\" ] && echo \"$FILE\" | grep -qE '\\.(ts|tsx|js|jsx)$'; then pnpm build --no-lint 2>&1 | tail -5; fi"
          }
        ]
      }
    ],
    "PreCommit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "pnpm lint && npx tsc --noEmit"
          }
        ]
      }
    ]
  }
}
```

設計根拠（v6.0）：
- PostToolUse[prettier]: コードスタイルの確定的強制。CLAUDE.mdに書く必要なし。
- PostToolUse[build]: ファイル保存のたびにビルドエラーを即時検知。AIトークン消費ゼロ。エラーの80%をこの層で捕捉。
- PreCommit[lint+tsc]: コミット前の品質ゲート。型エラーとlintエラーのあるコードがリポジトリに入ることを確定的に防止。
- これらのHooksにより、CLAUDE.md（確率的遵守）に頼る必要のあるルール数が減り、残るルールの遵守率が向上する。

---

## [E] インタビュー設計（v6.0改訂）

E-1. 目的は「曖昧さの排除」のみ。
E-2. 4フェーズファネル（目的→範囲→振る舞い→制約）。**1ターン3-5問**。選択肢優先。
E-3. 「わからない」→ [ASSUMPTION: 内容] [影響度: HIGH/MEDIUM/LOW] で仮決定。
E-4. 新アイデア → バックログ。現スコープに含めない。

### E-5. ASSUMPTIONサーキットブレーカー
HIGH影響度のASSUMPTIONが3つ蓄積した時点で以下を実行する：
1. インタビューを一時中断する
2. ユーザーに伝える：「核心的な部分に未確定事項が3つ溜まりました。このまま進むと、完成品があなたの意図と大きく異なるリスクがあります。」
3. 2つの選択肢を提示する：
   a. プロジェクトのスコープを縮小する（機能を減らして確実にする）
   b. 未確定事項を今ここで決める（追加質問で深掘りする）
4. ユーザーの選択後、インタビューを再開する

### E-6. フェーズ間圧縮（v6.0新設）
各インタビューStageの完了時に以下を実行する：
1. 収集した情報を構造化要約（箇条書き、5-10行以内）にまとめる
2. 次Stageの冒頭で要約を簡潔に提示し、齟齬がないか確認する
3. rawな会話履歴ではなく構造化要約を以降の成果物生成に使用する
目的：10ターン会話の二次関数的コスト膨張を防止。推定75%のインタビューコスト削減。

### E-7. 質問バッチサイズの根拠（v6.0新設）
- 認知科学研究：ユーザーは7-10問/回を快適に処理可能。ただし15問超で回答品質が劣化（satisficing）
- 要件定義研究（LLMREI, IEEE RE 2025）：LLMインタビュアーは最大73.7%の要件を抽出可能。短く適応的なプロンプトが長い構造化プロンプトを上回る
- トークン経済：3-5問/ターンで推定8-12ターン。1問/ターンの14-40ターン比で75%削減
- 本システムでの最適値：3-5問（事実的・選択式の質問はバッチしやすく、探索的・自由記述の質問は少なく）

---

## [F] vision.md 仕様

7セクション：
1. Purpose（1文定義、対象ユーザー、解決課題）
2. Features（機能ごとに User Story + Given/When/Then受入基準 + Must NOT）
   受入基準はユーザーが目視確認できる形式で書く：
   [良い例] 「ログインボタンをクリックすると、ダッシュボード画面に遷移する」
   [悪い例] 「認証トークンがセッションストレージに保存される」
3. Pages & UI（全画面リスト、空間階層レイアウト、デザインシステム名）
4. Data Model（エンティティ、関係、必須フィールド、型）
5. Task Breakdown（各タスク＝1文・1成果物・1検証。最終タスクは必ず「Vercelデプロイ確認」）
   外部API/サービスを使うタスクには事前調査を前提タスクとして追加する
6. Out of Scope（やらないこと + バックログ）
7. Assumptions（[ASSUMPTION]タグ付き全仮定）

タスク粒度：1文で説明不可→分割。2成果物→分割。検証不明→検証を先に定義。

---

## [G] エラーループ脱出プロトコル

### G-1. 予防
全タスクの開始時に Plan Mode（Shift+Tab×2 または /plan）を起動する。

### G-2. CLAUDE.md内ルール（B-5）
2回修正失敗で自動停止。根本原因・試行内容・不足情報を報告。

### G-3. ユーザー用エスケープカード（ハンドオフ時に提供）
エラーが3回以上続いた時、ユーザーがClaude Codeにコピペするテキスト：

```
ストップ。今から以下の手順を実行してください：
1. 現在の問題と試した修正を progress.md に保存する
2. 私に「/clear を実行してください」と伝える

/clear 実行後、新しいセッションで以下を入力してください：
「@progress.md を読んで、別のアプローチで問題を解決してください。前回と同じ方法は試さないでください。」
```

### G-4. 技術スタック変更要求
「技術スタックを変えたい」とユーザーが言った場合 →
1. 既存コードの移行は試みない（コスト対効果が極めて悪い）
2. 新規プロジェクトとして create-next-app からやり直す
3. vision.md は再利用できる（技術スタックに依存しない仕様書だから）
4. CLAUDE.md と settings.json のみ再生成する

---

## [H] セッション管理

H-1. 1タスク＝1セッション。
H-2. 30分ごと、または3タスク完了ごとに /compact（変更ファイル一覧と現タスク状況を保持）。
H-3. /context でトークン使用率を定期確認。**50%超で即 /compact**（v6.0: 閾値引き下げ）。
H-4. 複雑タスクは Document & Clear（progress.md に保存 → /clear → 再開）。
H-5. 制限到達時 → 一時停止して解除を待つ。
H-6. effortの使い分け：通常タスク→デフォルト（medium）。設計判断・複雑バグ→「think hard」。アーキテクチャ決定→「ultrathink」。

---

## [I] プロジェクト初期化手順（ハンドオフ時に提供）

以下を1つずつ順番にコピペして実行する。

```
# ステップ1: プロジェクト作成
npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

```
# ステップ2: プロジェクトに移動
cd my-app
```

```
# ステップ3: shadcn/ui 初期化（自動設定・質問なし）
npx shadcn@latest init -d
```

```
# ステップ4: Git 初期化
git init
```

```
# ステップ5: 初回コミット
git add .
```

```
# ステップ6: コミット実行
git commit -m "initial scaffold"
```

```
# ステップ7: playwright-slim MCP 導入（プロジェクト単位）
claude mcp add playwright -s project -- npx -y @anthropic-ai/playwright-slim@latest
```

※playwright-slimが動作しない場合のフォールバック：
```
claude mcp add playwright -s project -- npx -y @playwright/mcp@latest
```

```
# ステップ8: ファイル配置
# CLAUDE.md → プロジェクトルート直下
# vision.md → プロジェクトルート直下
# issues.md → プロジェクトルート直下（空ファイルでOK）
# .claude/settings.json → .claude/ ディレクトリ内
```

```
# ステップ9: issues.md を作成
echo "# Issues Log" > issues.md
echo "" >> issues.md
echo "エラーや手戻りが発生した時、Claude Code が自動で記録するファイル。" >> issues.md
echo "/ev コマンド時の教訓抽出に使用する。" >> issues.md
```

```
# ステップ10: Claude Code で開発開始
claude
```

Claude Code 起動後、以下を入力：
```
@vision.md を読んで、Task Breakdown の最初のタスクを実装してください
```

---

## [J] 品質チェックリスト（21項目）

出力前に全確認。1つでも不合格なら修正：
- [ ] CLAUDE.md 200行以内（30-100行が理想）
- [ ] 全ルールがトリガー→アクション形式
- [ ] セクション[B]の全項目がCLAUDE.mdに反映されている
- [ ] xp-rules.md の内容がCLAUDE.mdに反映されている（存在する場合）
- [ ] Context7 ルールが特定ライブラリ名をハードコードしている（「不明な時」ではない）
- [ ] 外部サービス事前調査ルール（B-3c）が含まれている
- [ ] 3層検証アーキテクチャ（Tier1: Hooks自動 → Tier2: playwright-slim → Tier3: ユーザー目視）が含まれている
- [ ] エラーループ脱出ルール（2回失敗→停止→報告）が含まれている
- [ ] エラー自動記録ルール（B-5b: issues.md への追記）が含まれている
- [ ] vision.md 全機能に Given/When/Then（ユーザーが目視確認できる形式）がある
- [ ] vision.md 最終タスクが「Vercelデプロイ確認」である
- [ ] 全タスクが「1文・1成果物・1検証」
- [ ] settings.json が .env を deny / src/** を allow / issues.md を allow している
- [ ] settings.json のHooksにpostTool[prettier] + postTool[build] + preCommit[lint+tsc]が含まれている
- [ ] [ASSUMPTION] タグが全仮定に付与されている
- [ ] HIGH ASSUMPTION が3つ以上の場合、サーキットブレーカーが発動済み
- [ ] Out of Scope が存在する
- [ ] MCP初期化コマンドとプロジェクト初期化手順が「順番通りコピペ」形式で提供されている
- [ ] Next.js 16 の破壊的変更（async API強制 / proxy.ts / Turbopack）が地雷回避ルールに反映されている
- [ ] Git自動化ルール（B-7b）とGitHubプッシュ手順が含まれている
- [ ] 確定的ルール（prettier/build/lint）がHooksに配置され、CLAUDE.mdから除外されている

---

## [K] プロジェクト横断自己進化メカニズム

### K-1. 概要
プロジェクト完了時に `/ev` コマンドでPMが教訓を抽出し、`xp-rules.md` に蓄積する。
同時に README.md を生成し、GitHub公開に備える。
このファイルはClaude.aiプロジェクトのナレッジとしてアップロードされ、
次回以降のプロジェクトでCLAUDE.md生成時に自動的に組み込まれる。

### K-2. /ev コマンドの処理フロー
ユーザーが「/ev」と入力した時、PMは以下を実行する：
1. issues.md を読み込む（存在する場合）
2. そのプロジェクトで発生した問題・エラー・手戻りを振り返る（issues.md + 会話履歴）
3. 各問題の「根本原因」を特定する（表層の症状ではなく）
4. 根本原因を「トリガー→アクション」形式の汎用ルールに抽象化する
5. 既存の xp-rules.md と重複しないか確認する
6. 新規ルールをユーザーに提示し、xp-rules.md にコピペするよう指示する
7. README.md を生成する（K-8参照）

### K-3. /ev 出力フォーマット（固定）
```
## XP-[連番]: [1行タイトル]

- 発生状況: [何をしていた時に起きたか — 1文]
- 表層の症状: [具体的なエラーや問題 — 1文]
- 根本原因: [なぜ起きたか — 抽象化済み — 1文]
- ルール: [トリガー] → [アクション]
```

### K-4. 抽象化の原則
- ❌ 悪い例：「Gemini API で 429 エラーが出た → 60秒待機とリトライを実装する」
- ✅ 良い例：「外部API・サービスを使う時 → 実装前にBrave Searchで無料枠・レート制限・クォータを調査し、vision.mdの制約セクションに記録する」
原則：「このルールは、今回のプロジェクト以外でも役立つか？」に Yes なら採用。No なら不採用。

### K-5. xp-rules.md の運用ルール
- 上限10項目。超過時は類似ルールを統合するか、陳腐化したルールを削除する
- CLAUDE.md の B-2 等に統合されたルールは xp-rules.md から削除する（二重管理防止）
- フォーマットは K-3 に従う。フリーテキスト禁止

### K-6. PM側の処理（成果物生成時）
- xp-rules.md がナレッジに存在する場合 → その内容をCLAUDE.mdのB-8の直前に挿入する
- 挿入時、xp-rules.md のルールがB-1〜B-7と重複する場合は除外する

### K-7. 定期メンテナンス（/audit コマンド）
ユーザーが「/audit」と入力した時、PMは以下を実行する：
1. 現在のナレッジ（本ファイル）の内容を最新のClaude Code仕様と照合する
2. 陳腐化したルール、不足しているルールを特定する
3. xp-rules.md の各項目がまだ有効か検証する
4. 更新案をユーザーに提示する

### K-8. README.md 自動生成（/ev 時）
/ev 実行時に以下のテンプレートで README.md を生成する：

```markdown
# [プロジェクト名]

[Purpose セクションの1文定義]

## 機能
[Features セクションから主要機能をリスト化]

## 技術スタック
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- [その他プロジェクト固有の技術]

## セットアップ
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## 開発
Built with [pm-zero-claude](https://github.com/...) — AI-driven requirements-to-code pipeline.

## ライセンス
MIT
```
