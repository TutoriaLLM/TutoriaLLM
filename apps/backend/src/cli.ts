//TutoriaLLM CLI

import fs from "node:fs";
import { Command } from "commander";
import inquirer from "inquirer";

import { createConfig, deleteConfig } from "@/modules/config";

const program = new Command();

// initialization command
program
	.command("init")
	.description("Initialize config.")
	.action(async () => {
		const { confirmInit } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirmInit",
				message: "Config will be initialized. Are you sure?",
			},
		]);

		if (confirmInit) {
			console.info("Initializing Config...");
			deleteConfig();
			createConfig();
			console.info("Config initialized.");
			process.exit();
		} else {
			console.info("Initialization canceled.");
			process.exit();
		}
	});

// Command to delete .initialized
program
	.command("delete-initialized")
	.description("Delete the .initialized file in app_data.")
	.action(async () => {
		const { deleteInit } = await inquirer.prompt([
			{
				type: "confirm",
				name: "deleteInit",
				message:
					"Do you want to remove .initialized in app_data? Database migration and user initialization will be performed.",
			},
		]);

		if (deleteInit) {
			console.info("Deleting .initialized...");
			if (fs.existsSync("/app_data/.initialized")) {
				fs.unlinkSync("/app_data/.initialized");
				console.info(".initialized deleted");
			} else {
				console.info(".initialized file does not exist.");
			}
		} else {
			console.info("Operation cancelled.");
		}
	});

// Parse and execute commands
program.parse(process.argv);
