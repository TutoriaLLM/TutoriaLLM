import fs from "node:fs";
import path from "node:path";
import { route } from "@/modules/config/routes";
import type { AppConfig } from "@/modules/config/schema";
import { createHonoApp } from "@/create-app";

/**
 * The directory path for storing the configuration file.
 * In production, it points to "/app_data". Otherwise,
 * it defaults to a local `app_data` folder.
 */
const volumePath =
	process.env.NODE_ENV === "production"
		? "/app_data"
		: path.resolve("app_data");

/**
 * The path of the primary configuration file (appConfig.json).
 * If a volume directory does not exist but a local `appConfig.json` exists,
 * it will use the local file instead. Otherwise, it uses the volume path.
 */
const configPath = fs.existsSync(volumePath)
	? `${volumePath}/appConfig.json`
	: fs.existsSync(path.resolve("appConfig.json"))
		? path.resolve("appConfig.json")
		: volumePath;

/**
 * The default configuration file used as a fallback if the volume
 * or local config file is not found.
 */
const defaultConfigPath = path.resolve("src/defaultAppConfig.json");

/**
 * Retrieve and parse the app configuration from the file system.
 * If no config file is found, a new one is created from defaultConfigPath.
 */
export function getConfig(): AppConfig {
	if (!fs.existsSync(configPath)) {
		createConfig();
	}
	const config: AppConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
	return config;
}

/**
 * Create a new configuration file from the default configuration file.
 * Attempts to place it in the volume directory first; if that's not possible,
 * creates it locally.
 */
export function createConfig() {
	if (fs.existsSync(path.dirname(volumePath))) {
		fs.copyFileSync(defaultConfigPath, `${volumePath}/appConfig.json`);
		console.info("Config file created in volume");
	} else {
		fs.copyFileSync(defaultConfigPath, path.resolve("appConfig.json"));
		console.info("Config file created locally");
	}
}

/**
 * Delete the existing configuration file, if present.
 */
export function deleteConfig() {
	if (fs.existsSync(configPath)) {
		fs.unlinkSync(configPath);
		console.info("Config file deleted");
	}
}

/**
 * Controller for returning the current application configuration.
 */
const app = createHonoApp().openapi(route, (c) => {
	const config = getConfig();
	return c.json(config);
});

export default app;
