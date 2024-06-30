import express from "express";
import { saltAndHashPassword } from "../../utils/password.js";
import { generateIdFromEntropySize } from "lucia";
// 既存のDBに接続する
import { db } from "../db/index.js";
import { User, NewUser, UpdatedUser } from "../../type.js";

const usersConfiguration = express.Router();

// JSONボディパーサーを追加
usersConfiguration.use(express.json());

// ユーザーの一覧を取得するAPI
usersConfiguration.get("/", async (req, res) => {
  try {
    //const users = userDB.prepare("SELECT * FROM users").all();
    const users = (await db
      .selectFrom("users")
      .selectAll()
      .execute()) as User[];
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

    const insert = await db
      .insertInto("users")
      .values({
        username: username,
        password: hashedPassword,
      } as NewUser)
      .returning("id")
      .executeTakeFirstOrThrow();
    if (insert.id !== undefined) {
      const user = await db
        .selectFrom("users")
        .where("id", "=", insert.id)
        .selectAll()
        .executeTakeFirstOrThrow();
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
usersConfiguration.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (typeof id !== "string") {
      res.status(400).json({ error: "ID is required" });
      return;
    }
    // const user = userDB
    //   .prepare("SELECT * FROM users WHERE id = ?")
    //   .get(id) as DatabaseUser;
    const user = (await db
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow()) as User;
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
  const id = Number(req.params.id);
  const { password, username } = req.body; // ここで必要なフィールドを指定

  try {
    if (password) {
      // パスワードが空でない場合はハッシュ化して更新
      const hashedPassword = await saltAndHashPassword(password);
      const result = await db
        .updateTable("users")
        .set({
          username: username,
          password: hashedPassword,
        } as UpdatedUser)
        .where("id", "=", id)
        .returning("id")
        .executeTakeFirstOrThrow();
      if (result.id !== undefined) {
        res.json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      // パスワードが空の場合はパスワードを更新しない
      // const update = userDB.prepare(
      //   "UPDATE users SET username = ? WHERE id = ?"
      // );
      const result = await db
        .updateTable("users")
        .set({
          username: username,
        } as UpdatedUser)
        .where("id", "=", id)
        .returning("id")
        .executeTakeFirstOrThrow();
      if (result.id !== undefined) {
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
usersConfiguration.delete("/:id", async (req, res) => {
  console.log("delete user");
  const id = Number(req.params.id);
  try {
    // const remove = userDB.prepare("DELETE FROM users WHERE id = ?");
    // const result = remove.run(id);
    const result = await db
      .deleteFrom("users")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirstOrThrow();

    if (result.id !== undefined) {
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
