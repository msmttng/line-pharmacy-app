# line-pharmacy-app プロジェクト

薬局向けLINE問診票アプリのプロジェクトフォルダです。

## フォルダ構成

```
line-pharmacy-app/
├── github-pages/   # GitHub Pages（本番フロントエンド）
│   ├── admin.html      ← 問診票管理画面（スケルトンUI・高速化済み）
│   ├── index.html      ← 患者向け問診票フォーム
│   ├── app.js
│   └── style.css
│
├── gas/            # Google Apps Script（バックエンド）
│   ├── Code.gs         ← APIエンドポイント・スプレッドシート連携（キャッシュ最適化済み）
│   ├── admin.html      ← GAS版管理画面（スケルトンUI・高速化済み）
│   ├── index.html      ← GAS版フォーム
│   └── .clasp.json     ← GASスクリプトID設定
│
├── source/         # フロントエンドソース（開発用）
│
└── _backups/       # 過去バックアップ（参照用）
    ├── success-backup/
    └── questionnaire-backup/
```

## デプロイ方法

### GAS（バックエンド）
```powershell
cd gas
npx @google/clasp push
```

### GitHub Pages（フロントエンド）
```powershell
cd github-pages
git add .
git commit -m "変更内容"
git push origin main
```

## 本番URL

- **管理画面**: https://msmttng.github.io/line-pharmacy-app/admin.html
- **問診票フォーム**: https://msmttng.github.io/line-pharmacy-app/

## 主要な改善履歴

| 日付 | 内容 |
|------|------|
| 2026-03-18 | admin.html 高速化：スケルトンUI・段階的レンダリング・タイムアウト+リトライ実装 |
| 2026-03-18 | Code.gs：JSONレスポンス軽量化（空フィールド除去）・キャッシュTTL最適化 |
| 2026-03-17 | admin.html モダンデザイン適用（admin_modern.html → admin.html） |
| 2026-03-17 | 調剤くん用コピーボタン追加 |
