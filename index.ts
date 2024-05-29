//entry point of the application

import express from "express";
require("dotenv").config(); // Load .env file
const app = express();
const port = process.env.PORT;

//frontend(Browser with Vite)
app.get("/", (req, res) => {
  console.log("new request!");
  res.send("<h1>Hello</h1>");
});

//Minecraft / Minecraft Edu Websocket join code
app.get("/:code", (req, res) => {
  const code = req.params.code;
});

//backend(Server)
app.get("/api", (req, res) => {
  res.send({ message: "Hello from the backend!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
