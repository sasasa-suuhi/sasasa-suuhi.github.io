# さささ｜数秘術のご案内サイト

HTML・CSS・JavaScriptだけで動く、GitHub Pages向けの静的サイトです。ビルドやサーバー用の設定、APIキーは不要です。

## 手元で見る

`index.html`をブラウザで開いてください。無料鑑定もローカルで動作します。編集中は簡易HTTPサーバーを利用しても構いません。

## GitHubで更新する

公開URL：https://sasasa-suuhi.github.io/

リポジトリ内では、このフォルダーを`site/`として保ちます。`main`ブランチのサイト本体を更新すると、`.github/workflows/pages.yml`が`site/`だけをGitHub Pagesへ公開します。`outputs`や`work`は含めません。

GitHubの設定は`Settings` → `Pages` → `Source: GitHub Actions`です。公開状況や手動実行は`Actions` → `Publish Sasasa website`から確認できます。READMEだけの編集では再公開しません。詳しくは[GitHub公式のワークフロー設定](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)を参照してください。

配布ZIPを別のホスティングに配置する場合は、ZIP内の`index.html`が公開ディレクトリの直下になるように展開してください。相対パスを使用しているので、サブディレクトリでの公開にも対応します。

## 内容を直す場所

- 文章、プロフィール、料金、リンク：`index.html`
- 色、余白、丸み、文字サイズ：`styles.css`
- 数字ごとの説明文：`numerology.js` の `meanings`
- トップの数字と相談例は `index.html` の `.reading-story`。水彩と手元の画像は `assets/reading-wash.webp` と `assets/reading-pencil.webp`
- トップの登場は `hero-motion.css`、相談例の紙と写真は `story-motion.css`、スクロール位置に応じた進行は `app.js`
- 自己紹介写真：`assets/sasasa-portrait.webp`

自己紹介写真のファイル名を変える場合は、`index.html`の参照も変更してください。ページの背景色とグラデーションは`styles.css`で調整できます。

## 無料ミニ鑑定

「ベースナンバー」は、このプロジェクトの確定済み計算における「誕生数」です。

1. 西暦年・月・日を整数として合計します。
2. 合計が2000以上なら上の桁と下2桁を足します。2000未満なら各桁の和を求めます。
3. 1桁になるまで各桁を足します。ここでは11・22を残しません。

例：1992年6月6日 → 2004 → 20＋4 → 24 → **6**。

入力はブラウザ内で計算し、外部送信や保存はしません。未入力・存在しない日付・未来の日付は受け付けません。無料結果の表示後に入力を変更すると、古い結果は閉じます。

## 申し込みとInstagram

- 個別鑑定は [Googleフォーム](https://forms.gle/M8jbemc9rDprEHAz6) で予約希望を受け付けます。
- 15分の無料相談をご希望の方には、[Instagramのプロフィール](https://www.instagram.com/sasasa_suuhi/) から「15分の無料相談希望」とDMを送るよう案内しています。

このサイト自体は、申込みや相談の情報を受け付けません。料金や受付条件を変更するときは、サイトとフォームの両方を更新してください。

公開中の個別鑑定は45分・3,000円です。60分へ切り替えるときは、Googleフォームの案内文と時間帯欄も合わせて更新してください。

申し込み通知はGoogleフォームの管理画面で設定します。`回答` → `回答のその他のオプション` → `新しい回答についてのメール通知を受け取る`をオンにすると、設定したGoogleアカウントへ通知が届きます。サイトのHTMLにメールアドレスを設定する方式ではありません。通知が見当たらない場合も、まず管理画面の回答件数を確認してください。

## 表示と文字

トップでは半透明の紙が開き、名刺の色に合わせた1〜9が弧を描いて整列します。縦に進むと背景の水彩が移動し、短い区間で画面に留まる紙の上に、手元の写真、相談の一例、次の問いが順に現れます。料金の紙面、プロフィール写真、無料ミニ鑑定の図も表示位置に合わせて動きます。スクロールにはブラウザ標準の動作を使っています。

画面幅に合わせた表示、スマートフォンの下部ボタン、メニュー、キーボード操作に対応しています。端末で動きを減らす設定をしている場合は、登場・スクロールの演出を止め、内容を静止した状態で表示します。

見出しは端末にある明朝体を、本文は「UDデジタル教科書体 NK」を優先します。これらの書体がない端末では、同梱のKlee Oneなどに切り替わります。Windowsのフォントファイルそのものは配布していません。

Klee OneはGoogle Fonts公式配布から取得したSIL Open Font Licenseのフォントで、ライセンスは`assets/fonts/`に収録しています。文字データは軽量化のため、このサイトで使う文字に絞っています。文章に新しい漢字などを追加すると、その文字だけ端末の代替フォントになる場合があります。その場合はフォントの再生成または配布元のフルフォントへの置き換えを行ってください。

フォント配布元：
- https://github.com/google/fonts/tree/main/ofl/kleeone

## 公開について

[GitHubリポジトリ](https://github.com/sasasa-suuhi/sasasa-suuhi.github.io)にサイト一式を保管し、[GitHub Pages](https://sasasa-suuhi.github.io/)で公開します。この公開URLをInstagramや名刺用QRコードに利用できます。

## 改訂前のサイトに戻す

2026年10月7日の改訂前は、[保存用ブランチ `codex/original-2026-10-07`](https://github.com/basasi19/sasasa-suuhi-site/tree/codex/original-2026-10-07)に保管しています。元のコミットは `5a4e8575ec1ea6ca3fe93f6e9f8763733d6714de` です。

手元ではタグ `site-original-2026-10-07` と、`outputs/site-backups/2026-10-07-original/` 内のZIP・Git bundle・復元スクリプトも保存しています。公開サイトを戻す場合は、保存した版の `site/` を `main` に戻して更新します。

2026年10月9日の料金・受付条件の変更前も、タグ `site-before-booking-2026-10-09`（コミット `47d1f89042f7bad7b36f9531db2327481cae2cef`）と、`outputs/site-backups/2026-10-09-before-booking/site-before-booking.zip`に保存しています。
