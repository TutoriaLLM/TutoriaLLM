# Example extension
拡張機能を作成するのに必要なすべてのファイルが詰まったリポジトリです。作成方法もここで説明します。

## 拡張機能でサポートされている機能
拡張機能は、ワークスペース全体にブロックを追加し、それらを実行することができるようにすることを目的としています。
ディレクトリ構成は以下の通りです：
 - script.js

 - blocks
 - context
 - toolbox
 - tutorials

### script.js / ts
script.jsに書き込んだ内容は、コードの実行時に常に実行されます。サーバーなどを使用する場合はここで定義することを推奨します。


### Blocks
Blocksは新しいブロックを定義する場所です。以下のように定義をします
 - block - Blocklyのjsonルールを使用して、ブロックを新規作成します。
 - code() - ブロックを実行する際に変換されるコードです。ここで変換されたコードは実行時にscript.jsの内容と結合されます。
 - locale - Blocklyのロケールです。対応させる必要のある言語を入力してください。

```js
import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_example_console_log",
	message0: "%{BKY_EXAMPLE_CONSOLE_LOG} %1",
	args0: [
		{
			type: "field_input",
			name: "TEXT",
			text: "hello world!",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: 230,
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_example_console_log = (block, generator) => {
		// Collect argument strings.
		const text_text = block.getFieldValue("TEXT");

		const code = `console.log("${text_text}");\n`;

		// Return code.
		return code;
	};
}

export const locale = {
	ja: {
		EXAMPLE_CONSOLE_LOG: "コンソールにテキストを送信",
	},
	en: {
		EXAMPLE_CONSOLE_LOG: "send console.log text",
	},
};
```

### Context
コンテキストは、script.jsやブロックに埋め込まれたコードを実行するのに使用されます。ここで定義したdefaultの宣言はサーバーで読み込まれます。コードの実行はサーバーサイドのnode vmモジュールで行われるため、純粋なjavascriptで使用できない機能はここで定義する必要があります。

### Toolbox
ToolboxディレクトリではBlocklyのブロックを取り出すツールボックスを定義します。以下のように定義します：
 - category - 新しく作るブロックのカテゴリ
 - locale - カテゴリ名のローカライズ
```js
export const category = {
	kind: "category",
	name: "%{BKY_EXAMPLE}",
	colour: "#a855f7",
	contents: [
		{
			kind: "block",
			type: "ext_example_console_log",
		},
	],
};

export const locale = {
	ja: {
		EXAMPLE: "開発例",
	},
	en: {
		EXAMPLE: "Example",
	},
};
```

### Tutorials
Tutorialsはデフォルトのチュートリアルを定義するディレクトリです。ちチュートリアルには必ず以下のフロントマター`(---)`を追加してください。
```
---
author: So Tokumaru
title: サーバーからHello Worldを送信しよう
keywords: 基本
description: Blocklyで作成したコードを実行して、サーバーからHello Worldを送信してみましょう。
---
# サーバーからHello Worldを送信しよう
```

## 拡張機能の作成方法

### 型定義の利用
以下のように型定義をインポートして使用することができます。定義は/src/ext_ctx.d.tsで行われています。

```ts
import type {
	Block,
	extLocale,
	extScriptContext,
	extCategory,
} from "extensionContext";

export const block: Block = {
	type: "ext_example_console_log",
	message0: "%{BKY_EXAMPLE_CONSOLE_LOG} %1 %2",
	args0: [
		{
			type: "field_input",
			name: "TEXT",
			text: "hello world!",
		},
		{
			type: "input_value",
			name: "VAR",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: 230,
	tooltip: "",
	helpUrl: "",
};

```

### 使用可能なコンテキスト
以下のコンテキストが使用可能です。コンテキストを使用することで、VM内部からサーバーの関数を呼び出すことができます。
 - code - ブロックのコードを実行
 - sessionOnStarting - VMを起動した際のセッション情報(SessionValue)を取得。
 - console
	- log - ログを出力
	- error - エラーログを出力
	- info - 情報ログを出力する関数ですが、フロントエンドでの出力時にハイライトされます。
 - app - Hono。ルーティングやWebsocketの接続を行う。
 - upgradeWebSocket() - WebSocketのアップグレードを行う、Honoの関数
 - serverRootPath - サーバーのルートパスを取得
 - t - ローカライズされた文字列を取得(i18n)します。拡張機能内では文字列の定義ができないため、`/i18n`ディレクトリで定義された文字列を取得します。

```