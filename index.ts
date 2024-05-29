import express from "express";
require("dotenv").config(); // Load .env file
const app = express();
const port = process.env.PORT;
app.get("/", (req, res) => {
  console.log("new request!");
  res.send("<h1>Hello</h1>");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
