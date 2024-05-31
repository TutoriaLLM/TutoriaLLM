"use strict";
//entry point of the application
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config(); // Load .env file
const app = (0, express_1.default)();
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
    res.sendFile(path_1.default.join(__dirname + "/client/index.html"));
    console.log("Hello from the frontend!");
});
// Serve assets files for vite
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "/client/assets"), {
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
}));
express_1.default.static.mime.define({ "application/javascript": ["js"] });
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
