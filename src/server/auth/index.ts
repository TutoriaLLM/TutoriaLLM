import express from "express";
import { saltAndHashPassword } from "../../utils/password.js";
import { getUserFromDb } from "../db/users.js";
import dotenv from "dotenv";

const auth = express.Router();
dotenv.config();

export default auth;
