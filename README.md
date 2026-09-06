# pm-zero v13

非エンジニアが、作りたいものの相談から環境構築・実装・公開までCodexに任せるための個人用開発手順です。VS Code / PowerShellのCodexを対象とし、Astraが判断、Luna/xhighが範囲の明確な実装を担当します。

ChatGPT Plusの利用枠を前提に、子エージェントは最大2、必要な実装と検証だけを行います。既存の月額AI契約以外の費用は0円で計画し、利用枠が戻るまでの中断は `tasks.md` から再開します。Claude Codeへの専用設定は、実際に使うときに追加します。

## 使い方

`pm-zero` と同じ親フォルダに新しいプロダクト用フォルダを作り、VS CodeまたはPowerShellのCodexで開いて伝えます。

> ○○のようなプロダクトを作りたい。隣のpm-zeroにあるpm-zero-knowledge-v13.mdに従って、このフォルダの環境構築から開発、デプロイまで実行して。

AIが最初に、使う人・困り事・主な操作・初版に必要なもの・扱う情報と公開範囲をまとめて聞きます。技術の名前を選んだり、skillコマンドを覚えたりする必要はありません。

途中で止まったときは、同じフォルダで「tasks.mdの現在地から再開して」と伝えます。利用枠が切れた場合は回復後に再開します。

## ファイル

| ファイル | 役割 |
| --- | --- |
| [pm-zero-knowledge-v13.md](pm-zero-knowledge-v13.md) | プロダクト開始から公開・再開までの手順 |
| [templates/AGENTS.global.md](templates/AGENTS.global.md) | 短い共通指示の原本。必要時に本体へ案内 |
| [templates/config.global.toml](templates/config.global.toml) | pm-zeroが管理するCodex設定の抜粋 |
| [AGENTS.md](AGENTS.md) | このリポジトリを保守するAI向けの入口 |
| [tasks.md](tasks.md) | v13更新の現在地・検証結果・再開情報 |
| [docs/decisions.md](docs/decisions.md) | 公式資料、Context7、外部事例の評価と判断根拠 |

## 別の環境への設定

Agentに「このリポジトリのv13を、この環境のCodexグローバル設定へ反映して」と依頼します。Agentは次の手順で反映します。

1. インストール済みCodexの版と利用可能な設定を確認し、既存の `~/.codex/AGENTS.md` と `config.toml` をローカルに退避する。
2. 共通指示テンプレートの `__PM_ZERO_ROOT__` をこのリポジトリの絶対パスへ置換し、`~/.codex/AGENTS.md` に配置する。独立した既存ユーザー指示があれば依頼外の内容を消さない。
3. 部分設定を `~/.codex/config.toml` の同じキーへ統合する。同じテーブルを追記で重複させず、接続・認証・その他の利用者設定を維持する。旧 `model_auto_compact_token_limit` は削除し、モデルごとの既定に任せる。コンパクションの判断は[調査記録](docs/decisions.md)のD08を参照する。
4. 設定の読込みを確認する。CLIは次回起動、VS Codeは次の設定読込みから適用を確認する。既存セッションが自動的に切り替わったとは扱わない。

検証対象はCodex CLI **0.153.4**（2026-09-07）。将来の版では公式schemaを照合します。追加のMCP・plugin・hookは導入していません。

実験的コンパクションは `features.context_management.experimental_mode = true` で有効です。対象のChatGPT認証・契約等の条件があり、設定の認識まで確認済みです。実際の消費削減率は未測定です。詳細と解除方法は[調査記録](docs/decisions.md)のD07を参照してください。
コンパクションの固定値は外し、モデルごとの既定を使います。手元のAstra/Lunaでは公称90％が基準です。50・60・70％の仮定付き比較と技術者の一次資料を検討し、モデル変更への追従と保守不要を優先しました。任意の％設定や、消費最小という保証はありません。

旧版のナレッジと旧更新履歴は現行ツリーから削除しました。過去の内容はGit履歴に残ります。利用者のローカル原稿・秘密・設定バックアップは公開対象に含めません。

MIT License。外部資料の手順をそのまま組み込まず、採用理由と出典を判断記録へ残しています。
