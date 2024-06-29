import express from "express";
import { saltAndHashPassword } from "../../utils/password.js";
import { DatabaseUser } from "../../type.js";
import { generateIdFromEntropySize } from "lucia";
// 既存のDBに接続する
import { userDB } from "../db/users.js";

const usersConfiguration = express.Router();

// JSONボディパーサーを追加
usersConfiguration.use(express.json());

// ユーザーの一覧を取得するAPI
usersConfiguration.get("/", (req, res) => {
  try {
    const users = userDB.prepare("SELECT * FROM users").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

usersConfiguration.post("/new", async (req, res) => {
  console.log("create user");
  const { username, password } = req.body;
  console.log("username: " + username);
  console.log("password: " + password);
  try {
    const hashedPassword = await saltAndHashPassword(password);
    const generatedID = generateIdFromEntropySize(16); // IDを生成
    const insert = userDB.prepare(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)"
    );
    const result = insert.run(generatedID, username, hashedPassword);
    if (result.changes > 0) {
      const user = userDB
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(generatedID) as DatabaseUser;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      console.log("Failed to create user...");
      res.status(500).json({ error: "Failed to create user" });
    }
  } catch (err) {
    console.log("Failed to create user" + err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// ユーザーの情報を取得するAPI
usersConfiguration.get("/:id", (req, res) => {
  const { id } = req.params;
  try {
    const user = userDB
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as DatabaseUser;
    const userWithType = user;
    if (user) {
      const { password, ...userWithoutPassword } = userWithType;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ユーザーの情報を更新するAPI
usersConfiguration.put("/:id", async (req, res) => {
  console.log("update user");
  const { id } = req.params;
  const { password, username } = req.body; // ここで必要なフィールドを指定

  try {
    if (password) {
      // パスワードが空でない場合はハッシュ化して更新
      const hashedPassword = await saltAndHashPassword(password);
      const update = userDB.prepare(
        "UPDATE users SET username = ?, password = ? WHERE id = ?"
      );
      const result = update.run(username, hashedPassword, id); // パラメータの順序を合わせる
      if (result.changes > 0) {
        res.json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      // パスワードが空の場合はパスワードを更新しない
      const update = userDB.prepare(
        "UPDATE users SET username = ? WHERE id = ?"
      );
      const result = update.run(username, id); // パラメータの順序を合わせる
      if (result.changes > 0) {
        res.json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ユーザーを削除するAPI
usersConfiguration.delete("/:id", (req, res) => {
  console.log("delete user");
  const { id } = req.params;
  try {
    const remove = userDB.prepare("DELETE FROM users WHERE id = ?");
    const result = remove.run(id);
    if (result.changes > 0) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.log("Failed to delete user" + err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default usersConfiguration;
