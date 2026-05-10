# pm-zero-claude

**AI を「指示する道具」から「自律実行できる同僚」に変えるための、再現可能な PM フレームワーク**

[![Version](https://img.shields.io/badge/version-9.2-blue)]()
[![Platform](https://img.shields.io/badge/platform-VSCode_/_PowerShell_/_Claude_Code_/_Codex_CLI-green)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

---

## 30 秒で理解する

非エンジニアが思いつく曖昧なプロダクトアイデアを、Claude Code / Codex CLI が**人間の追加指示なしに最後まで実装できる成果物パッケージ**に変換するための PM フレームワーク。

入力：「○○なアプリを作りたい」
↓
出力：AGENTS.md / CLAUDE.md / state.md / verify.mjs ほか
↓
CLI起動で AI が設計 → 実装 → テスト → 検証まで自律実行

---

## v9.2 の本質

v9.2 は単なるプロンプトではなく、

> **Vendor-neutral Agent Operating System**

Claude / OpenAI 両対応の「AI実行OS」

---

## 現在の正式環境

| 項目 | 内容 |
|---|---|
| Editor | VSCode on Windows |
| Terminal | PowerShell |
| Claude Code | Windows PowerShell から実行 |
| Codex CLI | Windows PowerShell から実行 |
| Project root | `C:\Users\chidj\project` |
| Project MCP | デフォルトなし。必要時だけプロジェクト単位で追加 |

---

## 特徴

| 特徴 | 内容 |
|---|---|
| Vendor-neutral | Claude Code / Codex CLI 両対応 |
| Codex-first | 実装は Codex CLI を主担当にできる |
| Reference-First | 実装前に実在例を確認 |
| Quality Gate | 検証を通過しない限り完了不可 |
| 自己検証 | build / test / lint / browser smoke を状況に応じて実行 |
| 一括生成 | AGENTS.md / CLAUDE.md / docs / scripts をまとめて生成 |
| 日本語運用 | 完了報告・意思決定を日本語で残す |
| 低コスト | 常時MCPを最小化し、Plus / Pro 運用に合わせる |

---

## アーキテクチャ

Phase 0：リサーチ
Phase 0.5：自己検証
Phase 0.6：Reference-First
Phase 1：インタビュー
Phase 2：成果物生成

---

## クイックスタート

```powershell
Set-Location C:\Users\chidj\project\pm-zero
claude --version
codex --version
git status
```

VSCodeで開く:

```powershell
code C:\Users\chidj\project\pm-zero
```

---

## 技術スタック

- Claude Code
- Codex CLI
- Node.js / pnpm
- Next.js / TypeScript
- Playwright / Playwright MCP
- GitHub

---

## 人間の役割（最小）

| 必要 | 理由 |
|---|---|
| APIキー | 外部API利用 |
| OAuth | 外部サービス接続 |
| 課金承認 | 法的責任 |
| deploy最終確認 | リスク管理 |

それ以外はAIが実行。

---

## 設計思想

AIに考えさせるのではなく、
「考え方・検証・品質基準」をOSとして外部化する。

---

## ライセンス

MIT

---

*pm-zero-claude v9.2*
