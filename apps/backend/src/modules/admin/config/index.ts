import fs from "node:fs";
import path from "node:path";
import { getConfigApp, updateConfigApp } from "@/modules/admin/config/routes";
import type { AppConfig } from "@/modules/admin/config/schema";
import { createHonoApp } from "@/create-app";

/**
 * The directory path for storing the configuration file.
 * In production, it points to "/app_data". Otherwise, it
 * defaults to a local `app_data` folder.
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
 * The default configuration file used as a fallback if the volume or local
 * config file is not found.
 */
const defaultConfigPath = path.resolve("src/defaultAppConfig.json");

/**
 * Get the current application configuration from the config file.
 * If the file does not exist, it will create a new one from the default.
 */
export function getConfig(): AppConfig {
	if (!fs.existsSync(configPath)) {
		createConfig();
	}
	const config: AppConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
	return config;
}

/**
 * Update the configuration file with the provided JSON object.
 */
export function updateConfig(newConfig: AppConfig) {
	if (!newConfig) {
		throw new Error("Invalid configuration data");
	}

	fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
	console.info("Config updated");
}

/**
 * Create a new config file (from the default) if one does not exist.
 * Prefers saving to a volume directory. If that fails, falls back to
 * creating it locally.
 */
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

/**
 * Controller for admin app configuration management.
 * Offers endpoints for retrieving and updating the global config file.
 */
const app = createHonoApp()
	/**
	 * Get the current app configuration
	 */
	.openapi(getConfigApp, (c) => {
		const config = getConfig();
		return c.json(config);
	})
	/**
	 * Update the app configuration
	 */
	.openapi(updateConfigApp, (c) => {
		const newConfig = c.req.valid("json");
		updateConfig(newConfig);
		return c.json(newConfig);
	});

export default app;
