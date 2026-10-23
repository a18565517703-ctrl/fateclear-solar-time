[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

# fateclear-solar-time

**時計の時刻と経度から、その場所の真太陽時を計算。補正の内訳も確認できます。**

暦アプリ、時刻変換ツール、AI アシスタント向けの小さな TypeScript ライブラリです。日付、時計の時刻、経度、UTC オフセットを入力すると、真太陽時、経度による補正、均時差、夏時間の状態を取得できます。二十四節気の時刻を調べる機能と、MCP サーバーも備えています。

[![CI](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaoyu312/fateclear-solar-time/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

開発・保守：[拨云 FateClear](https://fateclear.com) · [オンライン命式作成](https://fateclear.com/bazi) · [X で更新を見る](https://x.com/liu_xiaoyu27334)

## 入力と結果を見る

インストール後、ESM に対応した TypeScript プロジェクトから呼び出します。

```ts
import { trueSolarTime } from "fateclear-solar-time";

const r = trueSolarTime({
  year: 1990, month: 3, day: 12,
  hour: 23, minute: 30,
  longitude: 116.4,
});

r.longitudeCorrectionMinutes; // -14.4
r.dstCorrectionMinutes;       // 0
r.trueSolarText;              // YYYY-MM-DD HH:mm:ss
r.equationOfTimeMinutes;
```

標準時の UTC オフセットは、既定で +8 時間です。東経 116.4° の場合、経度による補正は `116.4 × 4 − 8 × 60 = −14.4` 分です。さらにその日の均時差を加えると、現地の真太陽時になります。補正値が項目ごとに返るため、アプリ側で計算過程を説明できます。

日付は、このリポジトリで既に公開されている API の使用例を引き継いだものです。戻り値の型は [src/solar-time.ts](src/solar-time.ts) を参照してください。

## 最短で使い始める

Git、Node.js 18 以降、npm、ESM に対応したプロジェクトが必要です。

```sh
npm install github:xiaoyu312/fateclear-solar-time
```

GitHub のソースパッケージからインストールします。インストール時に `prepare` が TypeScript をコンパイルするため、宣言された依存パッケージを取得できる環境が必要です。[v0.1.0](https://github.com/xiaoyu312/fateclear-solar-time/releases/tag/v0.1.0) は公開済みで、追加のダウンロード用添付ファイルはありません。生年月日からの命式作成や真太陽時の表示を試すには、[FateClear](https://fateclear.com/bazi) を利用できます。

## 主な機能

| 入口 | 入力と結果 |
| --- | --- |
| `trueSolarTime` | 時計の日付・時刻、経度、オプション → 現地の真太陽時・平均太陽時、UTC、分単位の補正値、夏時間の状態 |
| `solarTerms` / `solarTerm` | 西暦年、または年と節気名 → 二十四節気の時刻。簡体字・繁体字・英語の名称に対応 |
| `chinaDstStatus` / `CHINA_DST` | 中国の時計の時刻 → 夏時間の状態。または 1986–1991 年の開始・終了表を取得 |
| MCP サーバー | stdio を通じて、対応クライアントから変換・検索機能を利用 |

## ライブラリの使い方と引数

```ts
import { trueSolarTime, solarTerms, solarTerm, chinaDstStatus } from "fateclear-solar-time";

trueSolarTime({
  year: 1988, month: 7, day: 1,
  hour: 12, minute: 0, longitude: 120,
}).dstCorrectionMinutes; // -60

solarTerms(2026).length; // 24
solarTerm(1990, "立春").beijing;
solarTerm(1990, "Start of Spring").utc;

chinaDstStatus({
  year: 1990, month: 9, day: 16, hour: 1, minute: 30,
}); // "ambiguous"
```

`trueSolarTime` の引数：

| 引数 | 説明 |
| --- | --- |
| `year` / `month` / `day` / `hour` / `minute` | 時計に記録されたグレゴリオ暦の日付と時刻。月は 1–12 |
| `second` | 省略可能。既定値は 0 |
| `longitude` | 必須。−180 から 180 度の経度。東経は正、西経は負 |
| `latitude` | 省略可能。記録用で、計算には使用しない |
| `utcOffset` | 標準時の UTC オフセットを時間単位で指定。既定値は 8。夏時間は `dst` で別途処理 |
| `dst` | `"auto"`（既定。UTC+8 の場合に中国の 1986–1991 年の規則を適用）、`true`（強制的に 1 時間引く）、`false`（夏時間の補正をしない） |
| `eot` | `"precise"`（既定。天体位置から均時差を計算）、または `"simple"`（3 項の近似式） |

結果の `trueSolar` は日付・時刻の各フィールドです。`trueSolarText` と `meanSolarText` は整形済みの時刻、`utc` は対応する UTC 時刻です。`dstStatus` は夏時間の状態を示します。`dstCorrectionMinutes`、`longitudeCorrectionMinutes`、`equationOfTimeMinutes`、`totalCorrectionMinutes` で、個別の補正値と合計を確認できます。

`dstStatus` は `utcOffset` と組み込みの規則で判定され、`dst` を手動で切り替えても変わりません。補正を無効にしても `dst` と表示される場合があります。実際に適用された補正値は `dstCorrectionMinutes` で確認してください。

節気の結果には `index`、`zh`、`zhHant`、`en`、`longitude`、`utc`、`beijing` が含まれます。各年は小寒から始まり、`index` は 0–23 です。`beijing` は常に夏時間なしの固定 UTC+8 で表示されます。

## MCP 経由で AI アシスタントから使う

stdio に対応する MCP クライアントに、次の設定を追加します。クライアントから Git、Node.js、`npx` を実行できる必要があります。初回起動時には、GitHub ソースの取得、依存パッケージのダウンロード、コンパイルが発生する場合があります。

```json
{
  "mcpServers": {
    "fateclear-solar-time": {
      "command": "npx",
      "args": ["-y", "github:xiaoyu312/fateclear-solar-time"]
    }
  }
}
```

| ツール | 用途 |
| --- | --- |
| `true_solar_time` | `datetime`、`longitude`、任意のオプションを指定し、真太陽時に変換 |
| `solar_terms` | `year` と任意の `name` を指定し、1 年分または 1 つの節気を検索 |
| `china_dst` | 引数なしで 6 年分の表を取得。`datetime` を指定すると状態を取得 |

`datetime` は `YYYY-MM-DD HH:mm` 形式です。`true_solar_time` は `T` 区切りと秒の指定にも対応します。設定ファイルの場所はクライアントによって異なります。引数の定義は [src/mcp.ts](src/mcp.ts) を参照してください。

## 制約と検証範囲

- 本ライブラリは時刻変換と暦の検索を行います。完全な八字命式の作成や解釈は行いません。
- 夏時間の自動処理に組み込まれているのは、中国の 1986–1991 年の規則のみで、`utcOffset` が 8 のときに適用されます。世界各地の歴史的タイムゾーンを網羅するものではなく、経度から国を判定することもありません。他の地域では、標準時のオフセットと夏時間の扱いを別途決めてください。
- 夏時間の状態は `standard`、`dst`、`nonexistent`（時計を進めた際に存在しない時刻）、`ambiguous`（時計を戻した際に 2 回現れる時刻）です。自動モードでは `dst` と `nonexistent` の場合に 1 時間引き、`ambiguous` では引きません。状態の表示だけで曖昧さが解消されるわけではないため、切り替え前後の時刻は呼び出し側で確認してください。
- 節気は astronomy-engine を使い、太陽の視黄経から計算します。秒まで表示されますが、誤差が 1 秒未満であるという保証ではありません。ソース内のテストは 1900–2100 年を 7 年ごとに抽出し、tyme4ts との差を 2 分以内とするものです。すべての年についての保証にはなりません。
- `simple` の均時差は近似値です。既存テストは 2000 年を 7 日ごとに抽出し、`precise` との差を 2 分以内として比較します。すべての日付の誤差上限を示すものではありません。
- 夏時間のテストは、各年の切り替え境界を IANA の `Asia/Shanghai` 規則と照合します。テスト定義と CI 設定はリポジトリ内で確認できます。今回のドキュメント更新では、インストール、ビルド、テスト、MCP の起動、オンラインページの動作確認は行っていません。

リポジトリを取得済みの場合、ルートディレクトリで次の開発用チェックを実行できます。CI は Node.js 18、20、22 向けに設定されていますが、今回これらの環境で再検証したことを意味しません。

```sh
npm ci
npm run typecheck
npm test
npm run build
```

## ドキュメントと出典

- [API のエクスポート](src/index.ts) · [太陽時の実装](src/solar-time.ts) · [節気の実装](src/solar-terms.ts) · [夏時間の表](src/dst.ts)
- [テスト範囲](test/solar.test.ts) · [コマンドと依存関係](package.json) · [CI 設定](.github/workflows/ci.yml)
- [関連する暦データ](https://github.com/xiaoyu312/fateclear-calendar-data)：1900–2100 年の節気、干支、旧暦日付を CSV / JSON で提供。データには別途 CC BY 4.0 が適用されます。

## ライセンスと作者

本ライブラリは [MIT ライセンス](LICENSE) です。天文計算、MCP SDK、ビルド・テスト用依存パッケージの出典とライセンスは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。中国の夏時間表の出典も同じ文書に記載しています。

[FateClear](https://fateclear.com) で生年月日からの命式作成と解説を試せます。新しいプロジェクトや更新情報は [X](https://x.com/liu_xiaoyu27334) で発信しています。
