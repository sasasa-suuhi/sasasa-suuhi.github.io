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
- トップ写真：`assets/hero-journal.webp`
- 自己紹介写真：`assets/sasasa-portrait.webp`
- 固定背景の写真：`assets/background-garden.webp`

写真のファイル名を変える場合は、トップ・自己紹介写真は`index.html`、背景写真は`styles.css`の参照も変更してください。トップ画像は、承認された仮画像の雰囲気に合わせて内蔵画像生成で制作しました。

## 無料ミニ鑑定

「ベースナンバー」は、このプロジェクトの確定済み計算における「誕生数」です。

1. 西暦年・月・日を整数として合計します。
2. 合計が2000以上なら上の桁と下2桁を足します。2000未満なら各桁の和を求めます。
3. 1桁になるまで各桁を足します。ここでは11・22を残しません。

例：1992年6月6日 → 2004 → 20＋4 → 24 → **6**。

入力はブラウザ内で計算し、外部送信や保存はしません。未入力・存在しない日付・未来の日付は受け付けません。無料結果の表示後に入力を変更すると、古い結果は閉じます。

## 申し込みとInstagram

- Googleフォーム：https://forms.gle/M8jbemc9rDprEHAz6
- Instagram：https://www.instagram.com/sasasa_suuhi/

両方の入口から同じGoogleフォームを使います。このサイト自体は個人情報を受け付けません。料金や受付条件を変更するときは、サイトとフォームの両方を更新してください。

2026年10月9日の受付条件は、個別鑑定45分・3,000円です。受付は火・水・木曜日の19:00〜20:00、または20:00〜21:00の1時間枠です。フォームには希望日の日付入力と、曜日・時間帯の必須プルダウンを用意し、オンライン／オフラインの選択項目は設けていません。

申し込み通知はGoogleフォームの管理画面で設定します。`回答` → `回答のその他のオプション` → `新しい回答についてのメール通知を受け取る`をオンにすると、設定したGoogleアカウントへ通知が届きます。サイトのHTMLにメールアドレスを設定する方式ではありません。通知が見当たらない場合も、まず管理画面の回答件数を確認してください。

## 表示と文字

2026年10月7日の改訂では、写真と余白を中心としたレイアウト、細い「ひも」のモチーフ、数字を選び出す無料鑑定の表示、結果の問いをコピーするボタンを追加しました。コピーは操作したときだけ端末のクリップボードを使います。スクロール自体はブラウザ標準の動作を保ちます。

画面幅に合わせた表示、スマートフォンの下部ボタン、メニュー、スクロール時の表示、キーボード操作に対応しています。端末で動きを減らす設定をしている場合は、スクロール演出を抑えます。

見出し・本文ともに、端末にある「UDデジタル教科書体 NK」を優先します。その書体がない端末では、同梱のKlee Oneに切り替わります。Windowsのフォントファイルそのものは配布していません。

Klee OneはGoogle Fonts公式配布から取得したSIL Open Font Licenseのフォントで、ライセンスは`assets/fonts/`に収録しています。文字データは軽量化のため、このサイトで使う文字に絞っています。文章に新しい漢字などを追加すると、その文字だけ端末の代替フォントになる場合があります。その場合はフォントの再生成または配布元のフルフォントへの置き換えを行ってください。

背景にはトップ写真とは別の新緑の庭園写真を配置し、画面に固定しています。本文は半透明の明るい面の上をスクロールします。背景用の画像にも、内蔵画像生成を使用しました。

フォント配布元：
- https://github.com/google/fonts/tree/main/ofl/kleeone

## 公開について

[GitHubリポジトリ](https://github.com/sasasa-suuhi/sasasa-suuhi.github.io)にサイト一式を保管し、[GitHub Pages](https://sasasa-suuhi.github.io/)で公開します。この公開URLをInstagramや名刺用QRコードに利用できます。

## 改訂前のサイトに戻す

2026年10月7日の改訂前は、[保存用ブランチ `codex/original-2026-10-07`](https://github.com/basasi19/sasasa-suuhi-site/tree/codex/original-2026-10-07)に保管しています。元のコミットは `5a4e8575ec1ea6ca3fe93f6e9f8763733d6714de` です。

手元ではタグ `site-original-2026-10-07` と、`outputs/site-backups/2026-10-07-original/` 内のZIP・Git bundle・復元スクリプトも保存しています。公開サイトを戻す場合は、保存した版の `site/` を `main` に戻して更新します。

2026年10月9日の料金・受付条件の変更前も、タグ `site-before-booking-2026-10-09`（コミット `47d1f89042f7bad7b36f9531db2327481cae2cef`）と、`outputs/site-backups/2026-10-09-before-booking/site-before-booking.zip`に保存しています。
