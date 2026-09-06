# pm-zero v13 調査・判断記録

調査日: 2026-09-07 JST。採用した原則と確認できた仕様・設定変更を記録する。
公式仕様、手元の実測、外部作者の運用例、pm-zero側の提案を区別する。

## D01 — 調査に使う能力

要求: Astraの振る舞い、Codex設定、低消費の委譲・再開、再利用可能なヒアリング手順を調べる。

| 候補・種別 | 出典・版 | 適合性・権限・消費 | 判断・スコープ・確認 |
| --- | --- | --- | --- |
| Context7 / MCP | [upstash/context7](https://github.com/upstash/context7)、MIT。接続済みサービスの版番号は未確認 | 公開ライブラリ名と質問が外部サービスへ送られる。個人データ・設定全文・秘密は送らない。2ツールで必要箇所を検索 | ユーザー指定により既存接続を使用。`/openai/codex`のresolve/query成功。追加導入なし |
| OpenAI Docs / skill | セッション提供の `.system/openai-docs/SKILL.md`、版番号未提供 | 公式資料の選別手順。今回に適合。本文と移行用参照1つだけ読む | 既存skillを使用。公式Astraガイドの取得成功。OpenAI Docs MCPの追加導入は不要 |
| 標準Web・PowerShell・GitHub CLI | Codex CLI 0.153.4 / Apache-2.0、GitHub CLI 2.92.0 / MIT | 公開資料取得とローカル設定・Gitの検査を既存ツールで完結。外部コードを実行しない | 追加pluginなし。バージョン・リポジトリ読取り・設定読込み成功 |
| Chrome DevTools / MCP | 既存接続、今回の実行版は未調査 | 実画面確認向け。ブラウザ内容へアクセスでき、ツール定義も文脈を使う | 今回はUI変更がないため未使用。将来のUIタスクでは既存接続を選定して確認する |
| grill-me / skill | Matt Pocock、[skills](https://github.com/mattpocock/skills)、MIT、調査時main `3cca18b` / package 1.2.3 | Markdown中心でWindows対応。質問の長期化と委譲は追加消費になり得る | 手順の考え方のみ候補。丸ごと追加しない。自動ヒアリングはユーザー希望に合わせて設計 |
| ponytail / plugin・skill | Dietrich Gebert、[ponytail](https://github.com/DietrichGebert/ponytail)、MIT、v4.9.0 / `0a4dd63` | 既存機能の再利用・最小変更は適合。一方、Nodeフック、設定書込み、常時の指示注入が既存機能と重複 | plugin全体は不採用。必要な設計原則だけ短い文章で再構成。フックの実行・導入なし |

比較軸: 適合性、更新、Windows互換性、認証、データ露出、権限、文脈の使用量、既存機能との重複、ライセンス、再現性。
新規導入は現時点で0。既存接続・標準ツールで今回の要求を満たす。
将来の導入は具体的な不足が出た時点でプロジェクト内を優先し、版とスモーク確認を残す。

## D02 — Astra向けに調整する点

一次資料: [GPT-6 Astraの公式ガイド](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)。

公式は、Astraの確認の多さ、指示ファイルへの敏感さ、委譲頻度、検証の広がりを調整対象として挙げている。
提案: 完了する成果、質問が必要な分岐、すでに任された操作、担当分担、検証を終える条件を短く明記する。
理由: 曖昧な規則を多数重ねると、遵守のための停止や不要な作業が増える。実行条件を具体化するほうが今回の自律性・予算に合う。
APIの非同期ツールやキャッシュ更新機能を、Codex CLIの設定として捏造・転用しない。

## D03 — 少人数の役割分担

一次資料: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[設定リファレンス](https://learn.chatgpt.com/docs/config-file/config-reference)、Context7 `/openai/codex`。

- 現行の人数設定は `agents.max_concurrent_threads_per_session`。親を除く、同時に開かれた子の上限。旧名 `max_threads` は互換別名。
- `agents.default_subagent_model` と `agents.default_subagent_reasoning_effort` で子の既定を設定できる。指定なしでは親の設定を引き継ぐ経路がある。
- 独自役割は `~/.codex/agents/*.toml` または `.codex/agents/*.toml`。現行形式は `name`、`description`、`developer_instructions` を持つ。
- 委譲自体にも追加消費と調整の手間がある。人数上限は目標人数ではない。

採用: 親Astraが判断と統合、Luna/xhighが範囲の明確な実装。子は0〜2人、孫を増やさず、共有ファイルの同時編集を避ける。
小修正まで探索・実装・レビューの3段階へ分けない。担当者には目的・対象ファイル・完了条件・必要な検証だけを渡す。
検証担当を毎回設けず、具体的なリスクがある場合だけ独立確認する。

## D04 — 利用枠と過剰作業

一次資料: [Codexの料金・利用枠](https://learn.chatgpt.com/docs/pricing)。

公式の回数表示は固定の保証ではなく目安で、利用状況画面が実際の上限と回復時刻の確認先。
長い指示・不要な資料・MCPの数・モデル選択は使用量に影響する。APIの単価やキャッシュ割引から、Plusの残回数を計算しない。

ユーザー確定事項: 過剰実装・過剰テストを避け、上限到達時は回復を待つ。
提案: 受入条件を先に定め、将来使うかもしれない機能を作らない。変更に関係する既存検証を選び、成功後の反復は変更・失敗・未解決の懸念がある場合だけ。
見た目の微修正に無関係な全経路検証を積み増さない。重要な挙動・データ保護の検証は残す。
定常的な残量ポーリング、長時間の節約ベンチマーク、同じ調査の繰返しも既定にしない。

## D05 — 記憶の残し方と自動読込み

一次資料: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[skills](https://learn.chatgpt.com/docs/build-skills)、[長時間作業の計画例](https://developers.openai.com/cookbook/articles/codex_exec_plans)。
旧版の参考範囲: `pm-zero-knowledge-v12.2.md` の起動時ポインタ巡回と台帳の所有関係のみ。

採用: 常時読むグローバル指示は短くし、作業の詳しい手順は必要なときだけ読む。
プロジェクトの事実はファイルに残し、現在位置・未解決点・次の操作・検証済み内容から再開できるようにする。
会話履歴と台帳全体を毎回読む運用にはしない。内部の思考過程ではなく、決まった内容と根拠・結果を記録する。
ファイル数は固定しない。小規模では `tasks.md` の先頭に再開情報を含め、詳細が膨らんだ時だけ `docs/decisions.md` に分ける。

## D06 — 外部実践の扱い

[grill-me](https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md) は明示呼び出し用入口、[grilling](https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md) が質問の実体。
採り入れるのは、未解決の選択肢を一つずつ具体化し、調べれば分かる事実を利用者に聞かない考え方。
ユーザーはコマンドを覚えない運用を希望しているため、pm-zero側では新規プロダクトの相談を開始条件とする。質問方法はユーザーの最新指定を優先し、必要事項を一括提示する。
「すべての枝を無期限に質問する」は採らず、初回リリースの成果が決まるまでに限定する。

[ponytail](https://github.com/DietrichGebert/ponytail) の既存コード・標準機能・既存依存の再利用と不要な抽象化回避は参考になる。
ユーザーが示した「EngineeringでありCodingではない」という表現そのものの出典は未確認。作者の文言として引用しない。

参考実装: [codex-astra-luna-orchestrator](https://github.com/donvito/codex-astra-luna-orchestrator) (`b6fe51c`、Apache-2.0)、[astra-advisor](https://github.com/DannyMac180/astra-advisor) (0.2.0 / `c72d328`、MIT)、[LunaMaxxing](https://github.com/HakanBabus/LunaMaxxing) (`cfd13e2`、MIT)。
いずれも今回の上限・固定役割と完全一致しないため導入しない。役割の明示、短い依頼、親の受入責任の参考に限る。
[Noteの運用記事](https://note.com/lofarr_2501/n/n831362e563b5)、[Redditの体験談](https://www.reddit.com/r/codex/comments/1vh9nc6/how_to_efficiently_use_luna_max_subagents/)、[X投稿](https://x.com/td2sk/status/2085566341893988433)は補助資料。体験談の消費削減率を一般化しない。
外部候補の確認はLuna/xhighの調査担当1人へ委譲し、親は公式資料とローカル互換性を担当。重複する追加調査はしない。

## D07 — 実験的コンパクション（反映済み）

要求: ユーザーが新しい実験的なコンパクションを調査して有効化するよう追加依頼。
対応対象: 手元のCodex CLI `0.153.4`、Windows / PowerShell、ChatGPTログイン。

固定版の一次資料:

- [設定schema](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/core/config.schema.json)
- [feature定義](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/features/src/lib.rs)
- [適用条件](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/core/src/session/token_budget.rs)
- [実際のコンパクション経路](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/core/src/compact_token_budget.rs)

設定: グローバル `~/.codex/config.toml` の `[features]` に次の1行を追加。

```toml
context_management = { experimental_mode = true }
```

0.153.4では、対象のChatGPT契約と標準のCodex認証・接続条件を満たす場合、起動時にTokenBudget経路と履歴・メモ機能を有効にする。
そのコンパクションは要約生成のモデル呼出しを行わず、新しいコンテキスト枠へ切り替える。
推論: 要約生成分の消費削減が期待できるが、必要な履歴取得等もあるため、セッション全体の削減率・Plusでの残回数増加は未測定。保証しない。

比較: `remote_compaction_v2` は通常の圧縮経路で、手元では既にstable / true。`experimental_compact_prompt_file` は要約プロンプト差替え用であり、今回の機能ではない。`body_after_prefix` は閾値の数え方なので追加しない。
権限・データ露出: 既存のCodex会話処理内の機能。新しい外部サービス・APIキー・MCP権限は追加しない。履歴を必要に応じて参照するため、台帳を省略する理由にはしない。
確認: 実行版schemaがキーを定義。`codex features list` で `context_management under development true`。バックアップとの照合で追加1行のみ。詳細は `tasks.md`。
限界: 機能一覧のtrueは設定の認識までを示す。稼働中セッションの切替や、実際のコンパクション成功を示すものではない。次回の設定読込みを前提にし、節約のため長い試験会話は追加しない。
復旧: この追加行だけを削除すれば実験的設定を解除できる。グローバル設定全文の巻き戻しで、以後の別変更を消さない。
追補: 調査日に、同版のmacOS / Pro環境で履歴・メモ取得の404と状態喪失を報告する[Issue #43194](https://github.com/openai/codex/issues/43194)を確認した。手元のWindows / Plusで再現した事実ではない。[保守元PR #43147](https://github.com/openai/codex/pull/43147)はモデル能力による適用制御をmainへ追加しているが、手元の版と同一視しない。依頼どおり有効化を維持し、ファイル台帳を正本とする。実作業で履歴取得エラー等が出たら台帳を保存し、この機能を解除して通常経路へ戻す対処を行う。今回の実行確認は設定読込みまで。

## D08 — 50・60・70％の比較とモデル変更

要求: 旧グローバル設定136,000の妥当性を検討し、50・60・70％を比較する。親モデルを変えることがあるため、固定値による早すぎる切替も考慮する。
手法: 公式実装・手元のモデル情報の確認と、Python 3.13.14による仮定付き計算。長いモデル呼出し、実験セッション、追加ライブラリの導入は0。

固定版の一次資料:

- [設定schema](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/core/config.schema.json): `model_auto_compact_token_limit` は整数。任意の％・比率キーはない。
- [モデルの上限計算](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/protocol/src/openai_models.rs): 基準は `min(指定値またはモデル既定, 公称上限 × 0.9)`。指定もモデル既定もなければ公称上限の90％。
- [設定のモデルへの反映](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/models-manager/src/model_info.rs): ユーザー指定の固定値はモデルごとの値を上書きする。
- [切替判定](https://github.com/openai/codex/blob/rust-v0.153.4/codex-rs/core/src/session/context_window.rs): 実験経路の準備用bufferと実効上限も判定に関係する。

手元のAstraとLunaのモデル情報は、公称上限272,000、実効95％=258,400、独自auto-compact値なし、実験経路のbufferは16,384。
旧136,000は公称の50％、実効上限の約52.6％。表示上の％と公称比率を同じものとして扱わない。
実験機能もこの基準を使う。buffer後の強制切替目安は `min(基準 + 16,384, 258,400)`。モデルが先に切り替える場合もあるため、設定比率で必ず発火するとは言えない。

### 計算条件と結果

仮定: 累積の新規進捗1,000,000トークン、1回あたり4,000トークンずつ進む。切替後の文脈36,000は、共通指示等24,000 + 再取得履歴8,000 + 作業分4,000と置く。
各リクエスト前に基準以上なら文脈を36,000に戻す。bufferを使い切る実際の挙動とは区別し、同じ条件で3案を比較する。初期読み込みは切替回数に含めない。

| 公称比率 | 基準 | buffer後上限目安 | 切替回数 | 切替時の読み込み合計 | 平均リクエスト文脈 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 50％ | 136,000 | 152,384 | 9 | 324,000 | 84,000 |
| 60％ | 163,200 | 179,584 | 7 | 252,000 | 96,752 |
| 70％ | 190,400 | 206,784 | 6 | 216,000 | 109,056 |

これは利用枠の消費予測ではない。長い文脈は繰り返し入力され、キャッシュも影響するので、切替時の読み込み合計だけで節約を判定しない。
共通文脈8,000/24,000/48,000、再取得履歴0/8,000/24,000、作業分4,000の9通りでも計算した。切替回数の範囲は50％で8〜16回、60％で6〜11回、70％で5〜8回。持ち越す文脈が大きいほど50％の早期切替が不利になる。

| 判断要素 | 比較から分かること | 分からないこと・対策 |
| --- | --- | --- |
| 切替・履歴取得の頻度 | 70％が少なく、50％が多い | 実際の取得量や準備処理はタスク次第 |
| 毎回扱う文脈量 | 50％が短く、70％が長い | キャッシュとPlusの計数は公開情報だけで確定できない |
| 作業の連続性 | 高い基準ほど長く同じ文脈で進められる | 回答品質、重要情報の回収成功率はこの計算では測れない |
| 突発的な大出力の余裕 | 低い基準ほど余裕が大きい | 大量出力を絞り、上限判定を過信しない |
| 速度 | 低い基準は短い入力、高い基準は切替の少なさに利点 | モデル推論・履歴取得・ネットワーク次第で順位が変わる |
| 連続コンパクション | 引継ぎ文脈が基準に近いと、どの比率でも起こり得る | 常時指示・MCP・再読込みを絞り、短い台帳で再開する |
| モデル変更 | 固定値では比率が変わる | 任意比率に追従する標準設定は0.153.4にない |

参考: 固定163,200を設定した場合、公称128,000のモデルでは上限計算により115,200=90％、272,000では60％、1,000,000では16.32％になる。128,000/1,000,000は仕組みを説明する仮想例で、利用可能なモデルを示さない。
キャッシュが十分効き、切替時の再取得が重い条件では70％が有利になり得る。再利用された長文の入力負担が大きければ50％が有利になり得る。全条件で最適な比率はこの情報から決められない。
比較3案では60％が中間案になる。50→60では切替が2回減るのに対し60→70では1回で、文脈量の増加もあるため。ただし、この条件だけで実運用の最適値や設定変更の根拠としては不十分。

### 技術者の一次資料と最終採用

ユーザーは、信頼できるプロの技術者のWeb情報を基にAIが決定するよう指定した。追加の選択回答は不要とする。

- OpenAI Member of the Technical StaffのMichael Bolinによる[Codex agent loopの技術解説](https://openai.com/index/unrolling-the-codex-agent-loop/)（2026-01-23）。繰り返す推論には入力先頭の一致によるキャッシュが重要で、モデル・ツール等の変更も再利用に影響する。圧縮回数だけで効率を判断できない根拠として採用。
- Anthropic Applied AIチームのPrithvi Rajasekaranほかによる[context engineeringの技術解説](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)（2025-09-29）。過度な圧縮は重要な細部を失い得るため、必要な情報を保持し、外部メモで継続する考え方を採用。Claudeの具体的な挙動をAstraの仕様へ転用しない。
- OpenAI保守元の0.153.4実装は、前述のモデルごとの既定と上限計算を備える。説明記事より新しい具体仕様にはこの固定版を優先。
- [Issue #40095](https://github.com/openai/codex/issues/40095)にはキャッシュ率が高くても長い入力が負担になる実測報告がある。ただしユーザー投稿であり、作者も一致条件の比較実験ではなくPlus節約量は不明としている。保守元の推奨や50/60/70％の裏付けとして扱わない。一般の提案・体験談と一次の設計資料を区別する。

最終採用: **`model_auto_compact_token_limit` の固定指定を削除し、モデルの既定に任せる**。手元のAstra/Lunaでは90％=244,800が基準、実験経路のbuffer込み強制切替目安は実効上限258,400に制限される。モデル変更時はそのモデルの情報で解決される。
理由: 50/60/70％のどれかをAstra/Plusで一律最適とする信頼できる検証は確認できず、固定値を採用するとユーザーが気にしているモデル変更への追従を失う。保守元のモデル別の解決方法を使い、指示・ログ・読み直しを減らすことと台帳の継続性に注力する。これは運用上の採用判断であり、90％が消費最小・最高品質との主張ではない。
連続コンパクションには固定prefixや不具合も関係するため、この変更だけで解消すると保証しない。症状が出た時点で原因を特定する。架空の％キー、モデルごとの手動設定一覧、常駐hook、独自Codex改造は追加しない。

再現用の計算（標準ライブラリのみ。実モデル呼出しなし）:

```python
from math import ceil
for ratio in (0.5, 0.6, 0.7):
    limit, carry, context = int(272000 * ratio), 36000, 36000
    rollovers = total_input = 0
    for _ in range(1000000 // 4000):
        if context >= limit:
            context = carry
            rollovers += 1
        total_input += context
        context += 4000
    counts = [ceil(1000000 / (4000 * ceil((limit-p-h-4000)/4000)))-1
              for p in (8000, 24000, 48000) for h in (0, 8000, 24000)]
    print(ratio, limit, min(limit+16384, 258400), rollovers,
          rollovers*carry, total_input/250, min(counts), max(counts))
```

## D09 — ヒアリング結果と構成

確定: VS Code / PowerShellのCodex。製品種は固定しない。質問は必要事項をまとめて一括。既存月額AI契約以外の追加費用は0円。利用枠が切れたら回復を待つ。見た目の角丸0・カード群なし等は維持。ユーザーが明示した親モデル変更は認め、AIが勝手に別モデルへ切り替えることは禁止。
技術選定はAIが担い、用途の決まっていない機能・常駐処理・Claude専用設定・役割ファイル群は作らない。親の既存xhighは維持し、子の既定だけLuna/xhigh・同時2へ明示設定する。
短い共通AGENTSが必要時にv13へ案内し、製品ごとのAGENTSには固有の制約と実行方法だけ残す。具体的な専門役は標準委譲時の依頼で表現する。
旧版の参考は再開記録の考え方に限定した。追加依頼によるコンパクションの調査では、旧版の該当値も検索した。旧ナレッジ・旧更新履歴はGit履歴に残し、現行ツリーから除く。
