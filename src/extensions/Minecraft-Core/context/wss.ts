import { Context } from "vm";
import expressWs from "express-ws";

export default function websocketContext(context: Context) {
  context.createWebSocketServer = (options = {}) => {
    const wss: expressWs.Router = context.WebSocketRouter;
    return wss;
  };
}
