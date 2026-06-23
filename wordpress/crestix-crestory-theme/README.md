# Crestix CRESTORY WordPress Theme

CRESTORYをWordPressで運用するための採用広報メディア用テーマです。

## 主な仕様

- `https://crestory.crestix.jp/` をCRESTORYトップとして表示
- カスタム投稿タイプ `crestory` で記事を管理
- 専用カテゴリ `crestory_category`
- 専用タグ `crestory_tag`
- 注目記事フラグ、著者情報、SEOタイトル、SEOディスクリプション、OGP画像URLを管理画面で編集可能
- テーマ有効化時にカテゴリと代表インタビュー初期記事を作成

## 初期設定

1. `wordpress/crestix-crestory-theme` をWordPressの `wp-content/themes/` に配置
2. 管理画面でテーマを有効化
3. `設定 > パーマリンク` で「投稿名」を保存
4. 必要に応じて `wp-config.php` に `CRESTIX_RECRUIT_SITE_URL` を設定

```php
define("CRESTIX_RECRUIT_SITE_URL", "https://example.com");
```

## 推奨プラグイン

- SEO: Rank Math または Yoast SEO
- カスタムフィールド: Advanced Custom Fields（現テーマは標準メタボックスのみでも運用可能）
- セキュリティ: SiteGuard WP Plugin
- バックアップ: UpdraftPlus
- 画像最適化: EWWW Image Optimizer

## 既存採用サイト側

Crestory導線は `https://crestory.crestix.jp/` に向けます。
