import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { AppConfig, SessionValue } from "../../../type.js";

import { getConfig } from "../../getConfig.js";
import { updateDialogue } from "../../../utils/dialogueUpdater.js";
import { MessageHistoryFromSession } from "../../../utils/dialogueToChatHistory.js";
import { sessionDB } from "../../db/session.js";

let processingMessage = 0;
//sessionvalueを元に、会話を呼び出す。結果はdialogueに追加される
export async function invokeLLM(session: SessionValue) {
  console.log("invokeLLM");
  const config: AppConfig = await getConfig();
  processingMessage += 1;
  //   if (processingMessage > config.AI_Settings.Max_Number_of_processes) {
  //     updateDialogue(
  //       "AIの処理が多すぎます。しばらく待ってからもう一度お試しください。",
  //       session,
  //       "log"
  //     );
  //   }
  const model = new ChatOpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
  });
  const systemTemplate =
    "You are tutor of Coding with using this language: {language}";

  const userTemplate =
    "Answer for latest question from users includes past messages. If there is no question, encourage user to do coding.: {dialogue}";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", userTemplate],
  ]);

  const parser = new StringOutputParser();

  const chain = promptTemplate.pipe(model).pipe(parser);

  const response = await chain.invoke({
    language: "japanese",
    dialogue: session.dialogue,
    text: "hi",
  });

  return response;
}
