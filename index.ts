//entry point of the application

import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config(); // Load .env file
const app = express();

const port = process.env.PORT || 3000;

//Minecraft / Minecraft Edu Websocket join code
app.get("/join/:code", (req, res) => {
  const code = req.params.code;
  res.send(`<h1>Join code: ${code}</h1>`);
});

//backend(Server)
app.get("/api", (req, res) => {
  res.send({ message: "Hello from the backend!" });
});

//frontend(Browser with Vite)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
  console.log("Hello from the frontend!");
});

// Serve assets files for vite
app.use(
  "/assets",
  express.static(path.join(__dirname, "/client/assets"), {
    dotfiles: "allow",
    extensions: ["js", "css", "png", "jpg", "jpeg", "svg", "gif", "ico"],
    setHeaders: function (res, path) {
      if (path.endsWith(".js")) {
        res.setHeader("content-type", "application/javascript");
      }
      if (path.endsWith(".css")) {
        res.setHeader("content-type", "text/css");
      }
      // 他の拡張子に応じてヘッダーを設定する場合はここに追加
    },
  })
);
express.static.mime.define({ "application/javascript": ["js"] });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
