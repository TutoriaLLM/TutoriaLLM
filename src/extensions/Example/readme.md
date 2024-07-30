# Example Extention
拡張機能を作成するのに必要なすべてのファイルが詰まったリポジトリです。

## 拡張機能でサポートされている機能
拡張機能は、ワークスペース全体にブロックを追加し、それらを実行することができるようにすることを目的としています。
ディレクトリ構成は以下の通りです：
 - script.js

 - blocks
 - context
 - toolbox
 - tutorials

### script.js
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