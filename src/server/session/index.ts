import express from "express";
import router from "../db/index.js";

const session = express.Router();

session.use("/", router);

export default session;
