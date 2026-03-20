# Changelog - LINE Pharmacy App

## [Unreleased] - 2026-03-20

### Added
- 自動印刷用PDF（`createAndSavePdf`）のデザインを「A案：ハイライト強調＆2カラム構成（下半分メモ欄）」に変更
- 手書き問診票（AI OCR）とWebアプリのデータを区別するため、送信用データに `source: 'webapp'` を追加（`gas/app.html`, `github-pages/app.js`）
- `Code.gs` にて、Webアプリ経由（`source === 'webapp'`）の場合のみPDF自動印刷が実行されるよう処理を分岐
- MEDIXS併用薬ペースト ブックマークレット (`medixs-bookmarklet/`)
  - admin.htmlの手帳データをMEDIXS併用薬入力画面に自動入力
  - クリップボードからの自動読み取り
  - React対応のvalue設定（nativeInputValueSetter使用）
  - ブックマークレット設定ページ (`setup.html`)

### Fixed
- 管理画面（`admin.html`）にて、お酒の「飲まない」が注意色（緑太字）で表示されてしまう不具合を修正。
  - 同時にクリップボード出力時は「酒: なし」に変換されるよう修正。
