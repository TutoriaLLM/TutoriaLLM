import { Context } from "vm";
import { v4 as uuid } from "uuid";
import { WebSocketServer } from "ws";
import http from "http";
import expressWs from "express-ws";

export default async function (context: Context) {
  // ランダムな空いているポートを選択するために0を指定
  const websocketserver: expressWs.Router = context.WebSocketRouter;

  console.log("minecraft vm server created on expressWs");

  websocketserver.ws("/minecraft/:code", async (ws, req) => {
    const code = req.params.code;
    console.log("new minecraft connection+", code);

    ws.send(JSON.stringify(commandMsg("/say Hello,Minecraft!")));
    ws.send(JSON.stringify(subscribeMsg("PlayerMessage")));

    ws.on("message", async (message) => {
      try {
        const messageJson = JSON.parse(message.toString());
        console.log(messageJson);
      } catch (e) {
        console.log("invalid message received");
      }
      console.log("Minecraft message received");
    });

    ws.on("close", async () => {
      console.log("Minecraft WS disconnected");
    });
  });
}

function subscribeMsg(eventName: any) {
  console.log("Subscribed" + eventName);
  return {
    header: {
      requestId: uuid(),
      messagePurpose: "subscribe",
      version: 1,
      messageType: "commandRequest",
    },
    body: {
      eventName: eventName,
    },
  };
}

function unsubscribeMsg(eventName: any) {
  console.log("Unsubscribed" + eventName);
  return {
    header: {
      requestId: uuid(),
      messagePurpose: "unsubscribe",
      version: 1,
      messageType: "commandRequest",
    },
    body: {
      eventName: eventName,
    },
  };
}

function commandMsg(command: any) {
  return {
    header: {
      requestId: uuid(),
      messagePurpose: "commandRequest",
      version: 1,
      messageType: "commandRequest",
    },
    body: {
      version: 1,
      origin: {
        type: "player",
      },
      overworld: "default",
      commandLine: command,
    },
  };
}
