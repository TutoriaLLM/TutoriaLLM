import admin from "./admin/index.js";
import authRoute from "./modules/auth/index.js";
import session from "./session/index.js";
import tutorialsAPI from "./modules/tutorials/index.js";
import getConfigRoute from "./modules/config/index";
import statusRoute from "./serverStatus.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "./context";

//debug
console.log("apis.ts: Loading apis app");

const app = new OpenAPIHono<Context>();

app.use(async (c, next) => {
	c.set("trust proxy", "Hono is cool!!");
	await next();
});

// session routes
app.route("/session", session); //多分done

// Tutorial routes
// app.route("/tutorial", tutorialsAPI);

// config fetch route
app.route("/config", getConfigRoute); //done

// admin routes
// app.route("/admin", admin);

// auth routes
app.route("/auth", authRoute); //done

//hello world
app.get("/hello", (c, next) => {
	//done
	return c.text("Hello World!");
});

//死活監視用のエンドポイント
app.route("/status", statusRoute); //done

export default app;
