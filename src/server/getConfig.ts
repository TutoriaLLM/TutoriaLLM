import fs from "node:fs";
import path from "node:path";
import express from "express";
import { get } from "node:http";
import type { AppConfig } from "../type.js";

const volumePath = "/app_data";
const configPath = fs.existsSync(volumePath)
	? `${volumePath}/appConfig.json`
	: fs.existsSync(path.resolve("appConfig.json"))
		? path.resolve("appConfig.json")
		: volumePath;
const defaultConfigPath = path.resolve(
	"src/server/admin/defaultAppConfig.json",
);

export const getConfigApp = express.Router();

export function getConfig() {
	if (!fs.existsSync(configPath)) {
		createConfig();
	}
	const config: AppConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
	return config;
}

/**
 * @openapi
 * /config:
 *   get:
 *     description: Returns the app configuration
 *     responses:
 *       200:
 *         description: The app configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Not Found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Config not found
 */
getConfigApp.get("/", async (req, res) => {
	const config = getConfig();
	res.json(config);
});

export function updateConfig(newConfig: any) {
	if (!newConfig) {
		throw new Error("Invalid configuration data");
	}

	fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
	console.log("Config updated");
}

export function deleteConfig() {
	if (fs.existsSync(configPath)) {
		fs.unlinkSync(configPath);
		console.log("Config deleted");
	}
}

export function createConfig() {
	// Check if the volume directory exists
	if (fs.existsSync(path.dirname(volumePath))) {
		// Create a new config file in the volume if it doesn't exist
		fs.copyFileSync(defaultConfigPath, `${volumePath}/appConfig.json`);
		console.log("Config file created in volume");
	} else {
		// Fallback to local config if volume is not available
		fs.copyFileSync(defaultConfigPath, path.resolve("appConfig.json"));
		console.log("Config file created locally");
	}
}
