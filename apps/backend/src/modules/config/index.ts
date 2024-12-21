import fs from "node:fs";
import path from "node:path";
import { route } from "@/modules/config/routes";
import type { AppConfig } from "@/modules/config/schema";
import { OpenAPIHono } from "@hono/zod-openapi";

// const volumePath = "/app_data";
const volumePath = path.resolve("testconfig");

const configPath = fs.existsSync(volumePath)
	? `${volumePath}/appConfig.json`
	: fs.existsSync(path.resolve("appConfig.json"))
		? path.resolve("appConfig.json")
		: volumePath;
const defaultConfigPath = path.resolve("src/defaultAppConfig.json");

export function getConfig() {
	if (!fs.existsSync(configPath)) {
		createConfig();
	}
	const config: AppConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
	return config;
}
export function createConfig() {
	// Check if the volume directory exists
	if (fs.existsSync(path.dirname(volumePath))) {
		// Create a new config file in the volume if it doesn't exist
		fs.copyFileSync(defaultConfigPath, `${volumePath}/appConfig.json`);
		console.info("Config file created in volume");
	} else {
		// Fallback to local config if volume is not available
		fs.copyFileSync(defaultConfigPath, path.resolve("appConfig.json"));
		console.info("Config file created locally");
	}
}
export function deleteConfig() {
	if (fs.existsSync(configPath)) {
		fs.unlinkSync(configPath);
		console.info("Config file deleted");
	}
}

import type { Context } from "@/context";
import { defaultHook } from "@/libs/default-hook";
const app = new OpenAPIHono<Context>({ defaultHook }).openapi(route, (c) => {
	const config = getConfig();
	return c.json(config);
});

export default app;
