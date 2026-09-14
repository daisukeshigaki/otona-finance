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

## 講座構成（2026年9月14日更新）

- 初心者編：第1〜10回、全10講義。旧共通第0回は初心者編から除外。
- 初級編：第1〜29回、全29講義。
  - 第1回：会社とは・資本市場とは（旧第0回の会社・資本市場部分）
  - 第2回：株価とは・企業価値とは（旧第0回の株価・企業価値部分）
  - 第3回：PLの見方（旧第1回）
  - 第4回：BSの見方（旧第2回）
  - 第5回：CFの見方（旧第3回）
  - 第6〜29回：既存カリキュラムの旧第4〜27回。内容・順序は維持し、回数を一律＋2する。
  - FCF：旧第19回→第21回、DCF完全講座：旧第27回→第29回。

今後の制作は旧Excelの回数に2を加えて管理する。旧番号の画像フォルダは素材の識別子として維持する。原本Excelは変更しない。

旧URL `/basics/00/` は初級編第1回へ転送する。初級編の番号付きURLは新カリキュラムに合わせて再割当する（旧 `/beginner/01/` のPLは `/beginner/03/`、BSは `/beginner/04/`、CFは `/beginner/05/`）。

## 初級編の公開状況（2026年9月14日）

第1〜10回を公開。第6回「PL・BS・CFのつながり」、第7回「PERとは何か」、第8回「PBRとは何か」、第9回「株主価値と企業価値（EV）」、第10回「EBITDAとEV/EBITDA」を追加。
企業一次資料と計算の記録は `assets/data/lesson-06-10-sources.json`。各記事に確認日・期間・単位・実績と予想・仮定株価の区別を記載。
