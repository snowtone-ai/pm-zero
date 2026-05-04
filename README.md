# pm-zero-claude

**AI を「指示する道具」から「自律実行できる同僚」に変えるための、再現可能な PM フレームワーク（v9.0）**

[![Version](https://img.shields.io/badge/version-9.0-blue)]()
[![Platform](https://img.shields.io/badge/platform-Claude_Code_2.1.116+_/_Codex_CLI_0.115+-green)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

---

## 30 秒で理解する

非エンジニアが思いつく曖昧なプロダクトアイデアを、Claude Code / Codex CLI が**人間の追加指示なしに最後まで実装できる成果物パッケージ（58ファイル）**に変換するための PM フレームワーク。

入力：「○○なアプリを作りたい」
↓
出力：AGENTS.md / CLAUDE.md / state.md / verify.mjs ほか **全58ファイル**
↓
CLI起動で AI が設計 → 実装 → テスト → 検証まで自律実行

---

## v9.0 の本質

v9.0 は単なるプロンプトではなく、

> **Vendor-neutral Agent Operating System**

Claude / OpenAI 両対応の「AI実行OS」

---

## 特徴

| 特徴 | 内容 |
|---|---|
| 🔀 Vendor-neutral | Claude Code / Codex CLI 両対応 |
| 🚀 Codex-first | 実装は GPT-5.5 前提（Claude fallback） |
| 🔍 Reference-First | 実装前に実在例3件必須 |
| 🏆 Quality Gate | 7ゲート通過しない限り完了不可 |
| 🤖 自己検証 | 11ステップ自動検証 |
| 📦 一括生成 | 最初から全58ファイル |
| 🇯🇵 日本語強制 | 英語報告はhookでブロック |
| 💰 低コスト | $40/月（Pro + Plus）で運用 |

---

## アーキテクチャ

Phase 0：リサーチ  
Phase 0.5：自己検証  
Phase 0.6：Reference-First（実在例3件）  
Phase 1：インタビュー  
Phase 2：58ファイル一括生成  

---

## v8.0 → v9.0 の違い

| 項目 | v8.0 | v9.0 |
|---|---|---|
| CLI | Claudeのみ | Claude + Codex |
| 指示書 | CLAUDE.md | AGENTS.md |
| 実装 | Claude Code | Codex CLI |
| 品質保証 | 基本hook | 7ゲート |
| 参照 | AI内部知識 | 実在例3件 |
| ファイル | 段階生成 | 58一括生成 |

---

## クイックスタート

claude --version   # 2.1.116+  
codex --version    # 0.115+  

setup.bat  

claude --permission-mode bypassPermissions  
# または  
codex --sandbox danger-full-access  

---

## 技術スタック

- Claude Opus 4.7 / Sonnet 4.6
- GPT-5.5 / 5.4 / 5.4-mini
- Node.js 24 / pnpm
- Next.js / TypeScript
- Playwright MCP

---

## 人間の役割（最小）

| 必要 | 理由 |
|---|---|
| APIキー | ブラウザ操作 |
| OAuth | 同上 |
| 課金承認 | 法的責任 |
| deploy最終確認 | リスク管理 |

それ以外はAIが実行。

---

## 設計思想

AIに考えさせるのではなく、  
「考え方・検証・品質基準」をOSとして外部化する

---

## ライセンス

MIT

---

*pm-zero-claude v9.0*
