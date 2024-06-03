import express from "express";
import expressWs from "express-ws";
import ViteExpress from "vite-express";

import session from "./session/index.js";

const app = express();
expressWs(app);

//session routes
app.use("/session", session);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

//メモリ監視
// メモリ使用量を一定時間おきに監視する関数
const monitorMemoryUsage = (interval: number) => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(
      `プロセスの総使用量: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
    );
    console.log("-------------------------");
  }, interval);
};
monitorMemoryUsage(5000);
