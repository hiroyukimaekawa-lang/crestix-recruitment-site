# 技術SEO CLI（scripts/seo.mjs）

既存のUI・デザイン・bodyコンテンツを一切変更せず、`<head>` 内のSEOタグ・robots.txt・sitemap だけを
安全に自動化するためのCLIです。外部依存はなく、Node 18+ の標準APIのみで動作します。

## コマンド

```bash
npm run seo:audit                 # 全HTMLのSEO状態を監査（変更なし）
npm run seo:apply -- --dry-run    # 変更予定の表示のみ
npm run seo:apply                 # <head> / robots.txt / sitemap*.xml を適用
npm run seo:verify                # 適用結果をローカル検証
npm run seo:verify -- --url https://www.crestix.jp   # 本番URLも検証
npm run seo:jobs                  # 求人ページ専用監査（削除・統合はしない）
npm run seo:images -- --dry-run   # 画像・動画の最適化候補をレポート（変更しない）

node scripts/seo.mjs selftest     # UI保護と品質ゲートの動作確認（15項目）
```

共通オプション: `--no-report`（`reports/` へ出力しない）

## 変更してよい範囲（それ以外は絶対に触らない）

| 変更する | 変更しない |
|---|---|
| `<head>` 内のSEOタグ | `<body>` の中身・`<body>` タグの属性 |
| `robots.txt` | CSS / レイアウト / フォント / アニメーション |
| `sitemap.xml` / `sitemap-pages.xml` / `sitemap-jobs.xml` | ナビゲーション / メガメニュー / モーダル |
| | 求人ページデザイン / 応募フォーム / JavaScript |
| | 画像・動画ファイル（`seo:images` もレポートのみ） |

### UI保護の仕組み

1. HTML全体をDOMライブラリで再シリアライズしません。`<head>` の中身だけを文字列操作します。
   既存タグがあればその1件をその場で置換し、無ければ `<head>` 末尾の管理ブロックに追加します。

   ```html
   <!-- SEO:BEGIN managed by scripts/seo.mjs -->
   ...
   <!-- SEO:END -->
   ```

2. `apply` は書き換え前後に `<body>` 開始タグ〜`</body>` のSHA-256と、`<head>` 以外の全バイト列の
   SHA-256を比較します。1バイトでも差があればファイルを書かずに全体を中止します。

   ```text
   ERROR: Body content changed: index.html
   SEO apply aborted.
   ```

3. 適用後のハッシュを `reports/seo-body-hashes.json` に記録し、`seo:verify` が毎回突き合わせます。
   SEO適用後にbodyが変更されると `body hash` が FAIL になります。

## seo.config.json

サイト固有の情報はすべてこのファイルに置きます（コードへの直書きは禁止）。

| キー | 説明 |
|---|---|
| `siteType` | `recruitment` の場合のみ求人監査・`sitemap-jobs.xml` を有効化 |
| `siteName` / `companyName` / `baseUrl` | og:site_name / JSON-LD / canonical の生成元 |
| `searchConsoleVerification` | `null` ならタグを出力しない。値があれば `index.html` に1つだけ出力 |
| `ogImage` / `logo` | OGP画像・Organizationロゴ（サイトルートからの相対パス） |
| | OGP画像は 1200×630 / 1MB未満を推奨。逸脱すると `seo:verify` がWARNを出します |
| `organization` | 住所（Organization / JobPosting.jobLocation に使用） |
| `noindex` | `noindex, follow` を付与し、canonicalとsitemapから除外するページ |
| `exclude` | スキャン対象外ディレクトリ |
| `pages` | ページ個別の `description` / `canonical` の手動指定 |
| `jobs` | 求人ごとのメタデータ（`status` / `datePosted` / `validThrough` / `baseSalary`） |

### canonical

`.html` 形式を正規URLとします。

```text
index.html                       → https://www.crestix.jp/
jobs.html                        → https://www.crestix.jp/jobs.html
job-ai-medical-field-sales.html  → https://www.crestix.jp/job-ai-medical-field-sales.html
```

既存canonicalが**別ドメイン**を指している場合は意図的な指定とみなし、上書きせずWARNとして報告します
（そのページはsitemapにも載せません）。上書きしたい場合は `pages["<file>"].canonical` で明示します。

### description

ナビゲーション・ボタン文言を拾わないよう、以下の順で決定します。

1. `seo.config.json` の `pages["<file>"].description`（手動指定・最優先）
2. 本文中の明示的なリード文（`p.job-lead` など）
3. `<main>` 内の最初の「文章として妥当な」段落

品質ゲート（30文字以上 / 日本語15文字以上 / 文末表現あり / リンク2個以上を含まない /
JSで埋められる空要素プレースホルダを含まない / ナビ語彙を含まない）を通らない場合は
**meta descriptionを書き込まず WARN として報告** します。低品質な文章を勝手に入れることはしません。

`"description": null` を明示すると「意図的に生成しない」となりWARNも出ません。

### JobPosting

- 対象は `job-*.html` の個別求人ページのみ（`jobs.html` は対象外）
- ページ上に実在する情報と `seo.config.json` の `jobs` の値だけを使用します
- `datePosted` / `salary` / `validThrough` / リモート条件は**推測しません**。
  ファイル更新日・Gitコミット日・実行日を `datePosted` に流用することもしません
- 必須情報（title / description / datePosted / employmentType / jobLocation）が欠ける場合はスキップして報告します

```text
SKIP JobPosting:
job-ai-medical-field-sales.html
Reason: datePosted missing
```

掲載日を設定すると次回の `seo:apply` で JobPosting が生成されます。

```json
"jobs": {
  "job-ai-medical-field-sales.html": { "datePosted": "2026-04-01", "status": "active" }
}
```

### 求人の掲載ステータス（sitemap-jobs.xml の対象）

`sitemap-jobs.xml` には **`status: "active"` が明示された求人だけ** を掲載します。
正式求人が未確定の求人ページを検索エンジンへ送らないための仕様です。

| status | sitemap-jobs.xml | 自動noindex | seo:jobs |
|---|---|---|---|
| `active` | 掲載する | しない | 掲載中として表示 |
| 未指定（= `unknown`） | **載せない** | **しない** | **要確認求人として報告** |
| `draft` / `duplicate` / `inactive` / `closed` | 載せない | しない | その他として表示 |

`status: "active"` の求人が0件のとき、`sitemap-jobs.xml` は空で生成され、
`sitemap.xml`（Sitemap Index）からは除外されます（Search Consoleの「空のサイトマップ」エラー回避）。

```json
"jobs": {
  "job-ai-medical-field-sales.html": { "status": "active", "datePosted": "2026-04-01" },
  "job-hd-cs-leader.html":           { "status": "duplicate", "datePosted": null }
}
```

重複候補の統合・削除・canonical変更は、status を変えても自動では行いません。

## 求人ページの重複について

`seo:jobs` は重複候補・未リンク求人を**報告するだけ**で、ファイルの削除・統合・canonical変更は行いません。
正式求人の判断はレポートを確認したうえで手動で行ってください。

## 他サイトへの再利用

`scripts/seo.mjs` と `seo.config.json` をコピーし、`seo.config.json` を書き換えるだけで動作します。
`siteType` が `recruitment` 以外の場合、求人関連の監査と `sitemap-jobs.xml` は無効になります。
