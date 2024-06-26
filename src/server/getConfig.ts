import path from "path";
import fs from "fs";

const configPath = path.resolve("dist/appConfig.json");
const defaultConfigPath = path.resolve(
  "src/server/admin/defaultAppConfig.json"
);

export function getConfig() {
  if (!fs.existsSync(configPath)) {
    createConfig();
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  return config;
}

export function updateConfig(newConfig: any) {
  if (!newConfig) {
    throw new Error("Invalid configuration data");
  }

  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  console.log("Config updated");
}

function createConfig() {
  fs.copyFileSync(defaultConfigPath, configPath);
  console.log("Config file created");
}
