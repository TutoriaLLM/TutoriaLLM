import { Context } from "vm";
import { v4 as uuid } from "uuid";
import { WebSocketServer } from "ws";
import http from "http";

export default function (context: Context) {
  // ランダムな空いているポートを選択するために0を指定
  const server = http.createServer().listen(0, () => {
    const address = server.address();
    const port = typeof address === "string" ? address : address?.port;

    console.log(
      "minecraft vm server with https created on port " +
        port +
        " with path " +
        context.serverRootPath +
        "/minecraft"
    );

    const wss = new WebSocketServer({ server });

    wss.on("connection", function connection(ws: any) {
      ws.on("message", function incoming(message: any) {
        console.log("received: %s", message);
        ws.send("received: " + message);
      });

      ws.send("connected to minecraft server");
    });
  });

  server.on("error", (err) => {
    console.error("Server error:", err);
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
