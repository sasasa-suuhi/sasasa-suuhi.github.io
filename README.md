# さささ｜数秘術のご案内サイト

数秘術と対話を通して、自分の本音や持ち味を知るための案内サイトです。

**[公開サイトを開く](https://sasasa-suuhi.github.io/)**

## サイト本体

[`site/`](site/) に、HTML・CSS・JavaScript、画像、フォントをまとめています。ビルドやAPIキーは不要です。`site/index.html`をブラウザで開くと、無料ミニ鑑定も手元で動作します。

- 生年月日からベースナンバーを計算する無料ミニ鑑定
- 鑑定で大切にしていること、プロフィール、料金
- 申し込みフォームとInstagramへのリンク
- スマートフォン表示、スクロール時の表示、固定の自然写真背景

無料ミニ鑑定の入力はブラウザ内だけで処理し、保存・外部送信しません。

## 編集する

文章・料金・リンクは`site/index.html`、デザインは`site/styles.css`、数字ごとの説明は`site/numerology.js`を編集します。詳細は[サイトの説明書](site/README.md)をご覧ください。

## 公開と更新

GitHub Pagesで`site/`の内容を配信します。`main`ブランチのサイト本体を更新すると、[公開ワークフロー](.github/workflows/pages.yml)が自動実行され、同じURLに反映されます。公開状況はGitHubの`Actions`から確認できます。

公開用リポジトリは[`sasasa-suuhi/sasasa-suuhi.github.io`](https://github.com/sasasa-suuhi/sasasa-suuhi.github.io)です。`sasasa-suuhi` Organizationのメインサイトとして公開します。独自ドメインやレンタルサーバーの契約は不要です。

移行前のリポジトリ[`basasi19/sasasa-suuhi-site`](https://github.com/basasi19/sasasa-suuhi-site)は、過去の変更履歴と公開版の保存先として残しています。

## 素材

画像と同梱フォントを`site/assets/`に収録しています。Klee Oneのライセンスは[`KleeOne-OFL.txt`](site/assets/fonts/KleeOne-OFL.txt)を参照してください。端末にあるUDデジタル教科書体を優先して表示しますが、そのフォントファイルは同梱していません。
