<h1 align="center">
Kids Code Tutorial(仮称) <br /> <a href="https://github.com/google/blockly"><img src="https://tinyurl.com/built-on-blockly" /> </a>
</h1>

Kids Code Tutorial は、小中学生を対象とした、Web 上で使用できる、LLM によって提供されるセルフホスト型プログラミング学習プラットフォームです。教育コンテンツを制作する人と、そのコンテンツから学ぶ人たちのために設計されています。

このプロジェクトは 2024 年度の未踏ジュニアに採択され、最終報告会（11 月）までにすべての機能が使用できるようになる予定です。

## 設計

現在このアプリの大部分はまだ開発中です。開発に参加していただける方はぜひ[Discord コミュニティ](https://discord.gg/nAmPrUzVsN)でお会いしましょう。

- コンテンツ提供者
  - 教育を提供したことのある方は、このアプリを使用することで、より多くの人に質の高いプログラミングの授業を提供することができます。人間がアプリ内に提供したコンテンツをもとに、AI がユーザーへチュートリアルを提供します。
- 学習者
  - ブラウザからアプリにアクセスするだけで、すぐにチュートリアルを開始することができます。AI がリアルタイムな対話を提供することにより、一方的な動画やスライドのチュートリアルと比べて、わからないところをすぐに質問したり、フィードバックを得ることができるようになるため、効率よく学習することができます。

## アプリを使ってみる

### 開発サーバーの起動

サーバーはフロントエンドもバックエンドも単一の node.js でホストされています。また、以下の主要な技術を使用しています

- [Vite-Express](https://github.com/szymmis/vite-express)フロントエンドとバックエンドに使用。
- [Express.js](https://expressjs.com/)フロントエンドとバックエンドのルーティング。
  - [express-ws](https://github.com/HenningM/express-ws)セッションごとの websocket 通信に使用。
- [Vite](https://vitejs.dev/)開発サーバーとビルドに使用。
- [Tailwind CSS](https://tailwindcss.com/)スタイリングに使用。
- [Level](https://github.com/Level/level)ユーザーのセッションデータの保存に使用。
- [better-sqlite-3](https://github.com/WiseLibs/better-sqlite3)ユーザーの認証に使用。チュートリアルの保存にも使用する予定。
- [lucia-auth](https://lucia-auth.com/)ユーザーの認証に使用。
- [Jotai](https://jotai.org/)フロントエンドの状態管理。
- [react-i18next](https://react.i18next.com/)多言語対応に使用。バックエンドは通常の i18n を使用。

リポジトリを複製し、以下のコマンドを使用します。

```
npm i
npm run dev
```

### アプリを稼働させる

以下のコマンドでアプリをビルドし、起動させます。

```
npm run build
npm run start
```

認証情報は以下の方法でリセットできます。

```
npm run reset-user
```

### アプリの設定をする

- アプリを稼働させた状態で、`/admin`へアクセスします。
- 初期ユーザー名は`admin`、パスワードは`admin`です。

## 追加で使用できる機能

- [言語](src/i18n/): リポジトリ内のすべてのプログラムで多言語対応をしています。現在は４つの言語に対応していますが、いくつかの言語は機械翻訳によって生成されています。

  - 英語
  - 日本語
  - マレー語
  - 中国語簡体字

- [拡張機能](src/extensions/): 拡張機能を追加することで、新しいブロック、ツールボックスカテゴリ、VM を実行する際に使用できる追加の関数を設定することができます。
  - [Example(開発中)](src/extensions/Example/): 拡張機能の使用例です。作成方法は今後ドキュメントとして提供する予定です。
  - [Minecraft-Core(開発中)](src/extensions/Minecraft-Core/): Minecraft と本アプリを接続することができる拡張機能です。
