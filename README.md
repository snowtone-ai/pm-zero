<div align="center">

```
██████╗ ███╗   ███╗      ███████╗███████╗██████╗  ██████╗
██╔══██╗████╗ ████║      ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗
██████╔╝██╔████╔██║        ███╔╝ █████╗  ██████╔╝██║   ██║
██╔═══╝ ██║╚██╔╝██║       ███╔╝  ██╔══╝  ██╔══██╗██║   ██║
██║     ██║ ╚═╝ ██║      ███████╗███████╗██║  ██║╚██████╔╝
╚═╝     ╚═╝     ╚═╝      ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝
                                                       v11
```

**Budget-Bound Autonomous Solo-Dev OS — Claude Code × Windows PowerShell × Claude Pro**

[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Claude Code](https://img.shields.io/badge/runtime-Claude%20Code%20only-orange?style=flat-square&logo=anthropic)](https://code.claude.com)
[![Platform](https://img.shields.io/badge/platform-Windows%20PowerShell-blue?style=flat-square&logo=powershell)](https://learn.microsoft.com/powershell)
[![Version](https://img.shields.io/badge/version-v11-green?style=flat-square)]()
[![Plan](https://img.shields.io/badge/budget-Claude%20Pro%20%2420%2Fmo%20only-purple?style=flat-square)]()
[![RTK](https://img.shields.io/badge/token%20saving-60--90%25-brightgreen?style=flat-square)](https://github.com/rtk-ai/rtk)

</div>

---

> **月20ドルの固定予算で、エンジニアでなくても世界トップクラスのプロセスでソフトウェアを出荷できる。**
> 1つのClaude Codeエージェントが、設計から実装・レビュー・git・学習までを、許可プロンプト一切なしで完全自動実行する。

Status: 継続開発中

---

## これは何か

**pm-zero v11** は、Claude Code を使ったソロ開発を完全自律化するための **OSレベルのルールセット** です。

v10（Autonomous Solo-Dev OS）を、2つの現実的な制約で鍛え直しました：

1. **予算は月20ドルの壁** — Claude Pro プランのみ。従量課金なし。Sonnetが主役、Opusはオプション
2. **許可プロンプトは完全ゼロ** — v10で残っていたプロンプト漏れを根本原因から修正

```
あなた:「ログイン機能を実装して」

pm-zero v11:
  ✓ コードベースを調査（Haiku・独立コンテキスト）
  ✓ 実装（Sonnet）
  ✓ テスト作成・実行（バックグラウンド実行）
  ✓ 自己レビュー（新規コンテキストのSonnet — 高リスク時のみOpus）
  ✓ commit → push → PR → merge
  ✓ 完了報告（日本語）
  ✓ 失敗はルールに昇格して次回に活かす
  --- この間、許可を求められることは一度もない ---
```

---

## v10 からの主な変更点

| | v10 | **v11** |
|---|---|---|
| アイデンティティ | Autonomous Solo-Dev OS | **Budget-Bound** Autonomous Solo-Dev OS |
| 許可プロンプト | 「原則なし」だが漏れていた | **完全ゼロ**（bypassPermissions を正しいスキーマで設定） |
| 危険操作の防御 | denyルール（bypassでは効かない可能性） | **決定論的ガードフック**（全モード・全エージェントで必ず発火・16ケース検証済） |
| 自己レビュー | Opus必須 | **段階制**: 新規コンテキストSonnetが標準、最高リスク時のみOpus |
| モデル戦略 | Opus/Sonnet/Haiku 均等ルーティング | **Sonnetファースト**。Opusに依存しない設計 |
| 予算管理 | 「最重要制約」と宣言のみ | **セッション予算プロトコル**（10の運用ルール） |
| 並列作業 | 手動のスコープ管理 | **worktree分離**で衝突ゼロの並列実行 |
| セッション移行 | 手動で文脈再構築 | **/handoff** で引き継ぎ文書を自動生成 |

---

## なぜ v10 では許可プロンプトが出続けたのか（v11で修正済）

v11開発時に根本原因を3つ特定しました：

1. **設定キーが間違っていた** — トップレベルの `"permissionMode"` は無効。正しくは `permissions.defaultMode`。さらに `~/.claude/settings.local.json` はユーザーレベルでは読み込まれないファイルだった
2. **PowerShellツールが許可されていなかった** — `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` でシェル操作はPowerShellツール経由になるが、許可リストには `Bash` しかなかった
3. **新しいツール（Skill / ToolSearch / Task系）に許可ルールがなかった**

v11では `bypassPermissions` を正しい場所に設定し、安全性はプロンプトではなく**フック**で担保します。PreToolUseフックは bypass モードでも、サブエージェントでも、必ず発火する唯一の防御層です。

---

## 特徴

**💰 月20ドル固定で回る設計（v11の核心）**
Sonnet 4.6 が全作業の主役。探索は Haiku、Opus は最高リスクレビュー時のオプション。
セッション予算プロトコル：1セッション1タスク / 計画→/handoff→実行の分割 /
長いビルドはバックグラウンド / 質問はまとめて1回 / チェックポイント後にコンパクト。

**🔓 許可プロンプト完全ゼロ + 決定論的ガード**
`bypassPermissions` で全操作が即実行。危険操作（`rm -rf /`・force push・`git reset --hard`・
秘密ファイル読み取り）だけは `guard.mjs` フックが全モードで確実にブロック。
`.env.example` は許可（テンプレートファイルのため）。

**🧠 人間レビューなしの完全自動実装**
決定論的ゲート（verify + tests + lint）→ 新規コンテキストの自己レビュー → merge。
レビューの価値は「実装の思い込みを引き継がない新しいコンテキスト」にあり、
モデルの大きさではない — だから Sonnet レビューで成立する。

**🔄 自己進化システム**
同じエラーが3回 → 自動Web検索 → 根本原因特定 → `CLAUDE.md` に恒久ルール昇格。
予算切れもまた失敗として根本原因分析の対象。

**🛡️ 50%オートコンパクト前提設計**
ファイルが記憶、会話は使い捨て。論理単位ごとにチェックポイント＋コミット。
セッション移行は `/handoff` で無損失。

**⚡ トークン消費の徹底最適化**
RTK が全CLIコマンド出力を透過圧縮（60–90%削減）。CLAUDE.md はルックアップ表。
広範囲の読み込みは Haiku サブエージェントに隔離し、要約だけが戻る。

---

## モデルルーティング（Proプラン最適化）

| 用途 | モデル | 備考 |
|---|---|---|
| 実装・リファクタ・テスト・デバッグ（デフォルト） | Sonnet 4.6 | 全作業の90%以上 |
| 探索・ファイル読み込み | Haiku 4.5 | 独立コンテキスト、要約のみ返却 |
| 標準自己レビュー | Sonnet 4.6（新規コンテキスト） | 実装履歴を持たない |
| 最高リスクレビュー・アーキテクチャ | Opus 4.8（利用可能かつ予算が許す時のみ） | 使えなければSonnetで代替 |

**Opusが使えなくてもシステムは止まらない。** これがv11の設計原則です。

---

## クイックスタート

> 前提: Claude Code、Node.js、pnpm、Git、ripgrep、RTK がインストール済み。

### Step 1 — グローバル設定（初回のみ）

`~/.claude/settings.json` に v11 設定を配置（`permissions.defaultMode: "bypassPermissions"`、
RTK + guard の2フック、autocompact 50%）。`~/.claude/hooks/guard.mjs` を配置。
`~/.claude/CLAUDE.md` に v11 グローバル原則を配置。
詳細は `pm-zero-knowledge-v11.md` §7 を参照。

### Step 2 — プロジェクトを作る

```powershell
git clone https://github.com/yourname/pm-zero.git my-project
cd my-project
```

### Step 3 — プロジェクトを伝える

Claude Code を起動して話しかけるだけ：

```
「〇〇というアプリを作りたい。ユーザーは〜で、目的は〜」
```

PM Interview が `myself-info.md` を読んだ上で必要なことだけを一括質問し、
`docs/vision.md` と `tasks.md` を生成します。

### Step 4 — あとは任せる

```
「では実装を開始して」
```

以降は完全自律実行。完了時に日本語のハンドオフレポートが届きます。
大きな機能は「計画セッション → /handoff → 実行セッション」に自動分割されます。

---

## ファイル構成（デフォルト13ファイル・v10から不変）

```
my-project/
├── CLAUDE.md                    ← 主指令。毎ターン読み込み。lean設計
├── .claude/settings.json        ← 薄いプロジェクト設定（ベースはグローバル）
├── docs/
│   ├── vision.md                ← プロダクトの北極星
│   ├── state.md                 ← 現在の実行ポインタ
│   ├── decisions.md             ← 永続的な意思決定ログ
│   ├── issues.md                ← 失敗ログ → 自己進化の燃料
│   └── repo-map.md              ← ナビゲーションマップ
├── tasks.md                     ← 唯一の実行台帳
├── scripts/
│   ├── setup.mjs
│   └── verify.mjs               ← 統合検証エントリポイント
├── HANDOFF-JA.md                ← 完了・エラー報告テンプレート（日本語）
├── .env.example
└── .gitignore
```

---

## セッション予算プロトコル（v11新設）

Proプランの5時間ウィンドウ＋週次上限を前提にした運用ルール：

1. **1セッション1タスク** — 終わったら handoff して終了
2. **計画と実行を分ける** — 大機能は計画→`/handoff`→新セッションで実行
3. **読むのはHaiku** — メインコンテキストで大量読み込みしない
4. **RTK常時ON** — CLI出力を60–90%圧縮
5. **effortはmedium** — 難問だけ引き上げる（Opusに切り替えるより安い）
6. **長いコマンドはバックグラウンド** — ターンをブロックしない
7. **質問は一括** — 往復1回ごとにプロンプト1回分のコスト
8. **コンパクトはチェックポイント直後** — 調査の途中でやらない
9. **5分キャッシュを意識** — 休憩はチェックポイントで、タスク途中でしない
10. **壁の手前で止まる** — 使用量警告が出たら即チェックポイント＋commit＋handoff

---

## よくある質問

**Q. エンジニアでなくても使えますか？**
A. はい。それがpm-zeroの設計思想です。VSCodeとClaude Codeをインストールできれば使えます。

**Q. 本当にProプラン（月20ドル）だけで動きますか？**
A. v11はそれを前提に設計されています。Sonnetファースト・Haiku探索・RTK圧縮・
セッション予算プロトコルの組み合わせで、Proの利用枠内での持続運用を狙います。
Opusは「使えれば使う」オプションで、使えなくても全機能が動きます。

**Q. bypassPermissionsは危険では？**
A. 危険操作は`guard.mjs`フックが全モードで決定論的にブロックします（16ケース検証済）。
denyルールと違い、フックはbypassモードでもサブエージェントでも必ず発火します。
さらに「実際のお金・本番クレデンシャル・個人情報公開」は人間ゲートが残ります。

**Q. Opusなしのレビューで品質は保てますか？**
A. レビューの価値の源泉は「実装の思い込みを引き継がない新規コンテキスト」であり、
実装者（Sonnet）と同格のレビュアーで成立します。auth・課金・DBスキーマ等の
最高リスク変更だけは、Opusが使える時はOpusでレビューします。

**Q. Fable 5 は使いますか？**
A. いいえ。v11の設計にのみ使用しました（2026-07-07までの一時開放期間）。
ランタイムはOpus以下、基本はSonnetで動作します。

---

## 設計思想

> *「会話は使い捨て、ファイルが記憶。予算は壁、壁の中で最強を出す。」*

1. **ファイルシステムが唯一の真実の源泉** — チャット履歴が消えてもプロジェクトは続く
2. **エラーは欠けているルールのシグナル** — 失敗をルールに変換する
3. **予算は制約ではなく設計原理** — Sonnetファーストは妥協ではなく最適化
4. **安全はプロンプトではなくフックで** — 決定論だけが圧縮に耐える
5. **「人間レビューなし」≠「レビューなし」** — 新規コンテキストが盲点を消す

---

## ライセンス

MIT — 自由に使用・改変・再配布できます。

---

<div align="center">

**pm-zero v11 で、月20ドルの完全自律開発を。**

*Built for Claude Code. Designed for humans. Priced for students.*

</div>
