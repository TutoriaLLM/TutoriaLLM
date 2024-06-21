import express from "express";
import { DatabaseUser } from "../../type.js";

const usersConfiguration = express.Router();

// JSONボディパーサーを追加
usersConfiguration.use(express.json());

//ユーザーの一覧を取得するAPI

//ユーザーの情報を取得するAPI

//ユーザーの情報を更新するAPI

//ユーザーを削除するAPI

export default usersConfiguration;
