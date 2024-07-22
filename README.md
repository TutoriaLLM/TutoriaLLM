<h1 align="center">
Kids Code Tutorial(仮称) <br /> <a href="https://github.com/google/blockly"><img src="https://tinyurl.com/built-on-blockly" /> </a>
</h1>

Kids Code Tutorial は、小中学生を対象とした、Web 上で使用できる、LLM によって提供されるセルフホスト型プログラミング学習プラットフォームです。教育コンテンツを制作する人と、そのコンテンツから学ぶ人たちのために設計されています。

このプロジェクトは 2024 年度の未踏ジュニアに採択され、最終報告会（11 月）までにすべての機能が使用できるようになる予定です。

多少現在の内容とはズレがありますが、プロジェクトを開始した当初の説明動画です。

[https://youtu.be/Emb5GYgJis0?si=cTiSOld8gMYnfne2](https://youtu.be/Emb5GYgJis0?si=cTiSOld8gMYnfne2)

## 設計

現在このアプリの大部分はまだ開発中です。開発に参加していただける方はぜひ[Discord コミュニティ](https://discord.gg/nAmPrUzVsN)内のkids-code-turtorialチャンネルへご参加ください。

- コンテンツ提供者
  - 教育を提供したことのある方は、このアプリをホストすることで、AIが人間に代わって、より多くの人に質の高いプログラミングの授業を提供することができます。人間がアプリ内に提供したコンテンツをもとに、AI がユーザーへチュートリアルを提供します。
  - 学校やプログラミング教室、フリースクールなどの教育施設内での小規模な利用を想定しています。
    - お手持ちのサーバーからすぐに開始することができます。
- 学習者
  - ブラウザからアプリにアクセスするだけで、すぐにチュートリアルを開始することができます。AI がリアルタイムな対話を提供することにより、一方的な動画やスライドのチュートリアルと比べて、わからないところをすぐに質問したり、フィードバックを得ることができるようになるため、効率よく学習することができます。

### 拡張機能
コード開発ができるコンテンツ提供者は、拡張機能を作成することで、ユーザーがアプリで使える機能を増やすことができます。このページ下部の「追加で使用できる機能」セクションをご覧ください。

## アプリを使ってみる

### 開発サーバーの起動

> 現在Dockerへの移行を進めています。

VSCodeなどを利用してコードを編集することができます。
```
npm i
```

サーバーはDockerを利用してホストすることができます。以下のコマンドで開発サーバーを起動します：
```
docker build --nocache
docker compose up
```

### サーバーでアプリを稼働させる（実稼働）

自前のサーバーで稼働させる場合は以下のコマンドで実稼働アプリをビルドし、起動させます。
> 7月時点でこの機能はまだ開発中です

```
docker compose -f docker-compose.prod.yml up
```

### Docker Hubから取得する
[Docker Hub](https://hub.docker.com/r/soumame/code-tutorial-app)からイメージを取得することも可能です。PostgreSQL, Redisと接続する必要があります。
#### Postgresql
```
  db:
    container_name: code-tutorial-db-prod
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: code_tutorial_db
      PGDATA: /var/lib/postgresql/data/pgdata
      TZ: UTC
```

#### Redis
```
  redis:
    container_name: code-tutorial-redis-prod
    image: redis/redis-stack-server:latest
    ports:
      - "6379:6379"
```

認証情報は以下の方法でリセットできます。
```
npm run reset-user
```

初期チュートリアル（拡張機能から提供されるチュートリアル）は以下の方法でリセットできます。
```
npm run reset-tutorial
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

- [拡張機能](src/extensions/): 拡張機能を追加することで、新しいブロック、ツールボックスカテゴリ、VM(ブロックから変換されたユーザーのコードをnode vm moduleを使用して実行します) を実行する際に使用できる追加の関数（context）を設定することができます。
  - [Example(開発中)](src/extensions/Example/): 拡張機能の使用例です。作成方法は今後ドキュメントとして提供する予定です。
  - [Minecraft-Core(開発中)](src/extensions/Minecraft-Core/): Minecraft と本アプリを接続することができる拡張機能です。
