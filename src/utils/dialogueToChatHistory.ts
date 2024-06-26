import { Dialogue, SessionValue } from "../type.js";

import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import {
  BaseMessage,
  StoredMessage,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
} from "@langchain/core/messages";

// 既存のダイアログを新しいフォーマットに変換する関数

// export function convertDialogueToHistory(dialogue: Dialogue): BaseListChatMessageHistory {
//   return dialogue
//     .filter(
//       (entry) => entry.contentType === "user" || entry.contentType === "ai"
//     ) // 'user' と 'ai' コンテンツのみをフィルタリング
//     .map((entry) => {
//       if (entry.contentType === "user") {
//         // ユーザーのメッセージを HumanMessage に変換
//         return {
//           content: entry.content,
//           additional_kwargs: {},
//         } as HumanMessage;
//       } else {
//         // AI のメッセージを AIMessage に変換
//         return {
//           content: entry.content,
//           additional_kwargs: {},
//         } as AIMessage;
//       }
//     });
// }

//セッションコードをもとに、ダイアログを取得するように変更したら動くか？
import { updateDialogue, extractDialogue } from "./dialogueUpdater.js";
import { sessionDB } from "../server/db/session.js";
import { Level } from "level";

async function getDialogueFromDB(
  database: Level<string, string>,
  sessionCode: string
): Promise<Dialogue> {
  const data: SessionValue = JSON.parse(await database.get(sessionCode));
  const dialogue = extractDialogue(data);
  return dialogue;
}

export class MessageHistoryFromSession extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message"];

  sessionCode: string;

  // Simulate a real database layer. Stores serialized objects.
  database: Level<string, string>;

  constructor(fields: MessageHistoryFromSession) {
    super(fields);
    this.sessionCode = fields.sessionCode;
    this.database = fields.database;
  }

  async getMessages(): Promise<BaseMessage[]> {
    const dialogue = await getDialogueFromDB(this.database, this.sessionCode);
    const messages: StoredMessage[] = dialogue
      .filter(
        (entry) => entry.contentType === "user" || entry.contentType === "ai"
      )
      .map((entry) => {
        if (entry.contentType === "user") {
          return {
            type: "human",
            data: {
              content: entry.content,
              additional_kwargs: {},
            },
          } as StoredMessage;
        } else if (entry.contentType === "ai") {
          return {
            type: "ai",
            data: {
              content: entry.content,
              additional_kwargs: {},
            },
          } as StoredMessage;
        } else {
          throw new Error("Invalid content type");
        }
      });
    return mapStoredMessagesToChatMessages(messages);
  }

  async addMessage(message: BaseMessage): Promise<void> {}

  async addMessages(messages: BaseMessage[]): Promise<void> {}

  async clear(): Promise<void> {}
}
