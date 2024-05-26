var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen();

console.log("http server listening");

var wss = new WebSocketServer({ server: server });
console.log("websocket server created");

wss.on("connection", function (ws) {
  console.log("websocket connection open");

  ws.on("close", function () {
    console.log("websocket connection close");
  });
});
