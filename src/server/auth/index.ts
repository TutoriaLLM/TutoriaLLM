import express from "express";
import { ExpressAuth } from "@auth/express";
import Credentials from "@auth/express/providers/credentials";
import { saltAndHashPassword } from "../../utils/password.js";
import { getUserFromDb } from "../db/users.js";
import dotenv from "dotenv";

const auth = express.Router();
dotenv.config();

auth.use(
  "/*",
  ExpressAuth({
    secret: process.env.VITE_AUTH_SECRET as string,
    providers: [
      Credentials({
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        credentials: {
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          let user = null;

          // logic to salt and hash password
          const pwHash = await saltAndHashPassword(
            credentials.password as string
          );
          const username = credentials.username as string;

          // logic to verify if user exists
          user = await getUserFromDb(username, pwHash);

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error("User not found.");
          }

          // return user object with the their profile data
          return user;
        },
      }),
    ],
  })
);

export default auth;
