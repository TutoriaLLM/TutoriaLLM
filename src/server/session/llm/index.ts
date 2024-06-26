import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { AppConfig, SessionValue } from "../../../type.js";

import { getConfig } from "../../getConfig.js";
import { updateDialogue } from "../../../utils/dialogueUpdater.js";
import { MessageHistoryFromSession } from "../../../utils/dialogueToChatHistory.js";
import { sessionDB } from "../../db/session.js";

//sessionvalueを元に、会話を呼び出す。結果はdialogueに追加される
export async function invokeLLM(session: SessionValue) {
  console.log("invokeLLM");
  const config: AppConfig = await getConfig();
  const model = new ChatOpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
    model: config.AI_Settings.AI_Model,
    temperature: config.AI_Settings.AI_Temperature,
  });
  const systemTemplate =
    "You are tutor of Coding with using this language: {language}";

  const userTemplate = `
    Answer for latest question from users includes past messages if it exists:{text}
    This is past record of messages includes user chat, log from server, and AI response: {dialogue}
    If there is no question, encourage user or provide feedback based on past messages, or explain whats happening in the server
    `;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", userTemplate],
  ]);

  const parser = new StringOutputParser();

  const chain = promptTemplate.pipe(model).pipe(parser);

  const response = await chain.invoke({
    language: session.language,
    dialogue: JSON.stringify(session.dialogue),
    text: session.dialogue[session.dialogue.length - 1].content,
  });

  return response;
}
