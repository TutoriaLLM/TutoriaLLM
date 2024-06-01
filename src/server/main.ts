import express from "express";
import ViteExpress from "vite-express";

import session from "./session/index.js";

const app = express();

//session routes
app.use("/session", session);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
