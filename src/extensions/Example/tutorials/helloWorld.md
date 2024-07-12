---
author: So Tokumaru
title: サーバーからHello Worldを送信しよう
keywords: 基本
description: Blocklyで作成したコードを実行して、サーバーからHello Worldを送信してみましょう。
---
# サーバーからHello Worldを送信しよう

# 作成するブロック

作成するブロックはこんな感じです。
Blocklyのワークスペース内容の一部をjsonとして表示しています。

# 気をつけること

- 繰り返す回数と多く設定してしまうと無限ループが発生してしまいます。
- コードは、あなたのブラウザではなく、サーバー側で実行されるので、無限ループを作成してしまうとサーバーが壊れてしまいます。やめましょう。

```
This is converted code of Blockly workspace: {
  "blocks": {
    "languageVersion": 0,
    "blocks": [
      {
        "type": "controls_repeat_ext",
        "id": "*@RAq$Vny@dTB9HhumjY",
        "x": 50,
        "y": 130,
        "inputs": {
          "TIMES": {
            "block": {
              "type": "math_number",
              "id": "[:IdvAg*.t1We2cf3{,w",
              "fields": {
                "NUM": 10
              }
            }
          },
          "DO": {
            "block": {
              "type": "ext_example_console_log",
              "id": "vPkoHNfqMKJm0xRDB=H(",
              "fields": {
                "TEXT": "hello world!"
              }
            }
          }
        }
      }
    ]
  }
}
```