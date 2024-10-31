import * as path from "node:path";
import express from "express";
import type { AppConfig } from "../../type.js";
import { getConfig, updateConfig } from "../getConfig.js";

const appConfiguration = express.Router();

// JSONボディパーサーを追加
appConfiguration.use(express.json());

/**
 * @openapi
 * /admin/config/update:
 *   post:
 *     description: Updates or creates the app configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppConfig'
 *     responses:
 *       200:
 *         description: Config updated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Config updated
 */
appConfiguration.post("/update", (req, res) => {
	const newConfig: AppConfig = req.body;
	updateConfig(newConfig);
	res.send("Config updated");
});

/**
 * @openapi
 * /admin/config/:
 *   get:
 *     description: Returns the app configuration
 *     responses:
 *       200:
 *         description: The app configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppConfig'
 */
appConfiguration.get("/", async (req, res) => {
	const config: AppConfig = await getConfig();
	res.json(config);
});

export default appConfiguration;
