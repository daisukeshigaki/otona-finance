# おとなのファイナンス

会計・企業分析・投資を体系的に学べる、Cloudflare Pages向けの静的サイトです。

## 公開手順
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. GitHubの `otona-finance` リポジトリを選択
3. Production branch: `main`
4. Framework preset: `None`
5. Build command: 空欄
6. Build output directory: 空欄
7. Deploy

公開後に `xxxxx.pages.dev` のURLが発行されます。`main` ブランチへ更新をpushすると自動再デプロイされます。
