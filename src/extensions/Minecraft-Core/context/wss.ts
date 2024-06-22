import { Context } from "vm";
import expressWs from "express-ws";

export default function websocketContext(context: Context) {
  console.log("WebSocket context loaded");
  context.createWebSocketServer = (options = {}) => {
    if (!context.WebSocketRouter) {
      console.error("WebSocketRouter not found in context");
    }
    const websocketServer: expressWs.Router = context.WebSocketRouter;
    console.log("WebSocket server created at" + context.serverRootPath + "/ws");
    return websocketServer;
  };
}
