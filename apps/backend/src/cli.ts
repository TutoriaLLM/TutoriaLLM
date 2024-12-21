//TutoriaLLM CLI

import fs from "node:fs";
import { Command } from "commander";
import inquirer from "inquirer";

import { resetCredentials } from "@/db/users";
import { createConfig, deleteConfig } from "@/modules/config";
import { saltAndHashPassword } from "@/utils/password";

const program = new Command();

// User Registration Commands
program
	.command("register")
	.description(
		"Register a user. If the DEFAULT_USER_NAME and DEFAULT_USER_PASSWORD environment variables are set, they will be used.",
	)
	.action(async () => {
		const { DEFAULT_USER_NAME, DEFAULT_USER_PASSWORD } = process.env;

		if (DEFAULT_USER_NAME && DEFAULT_USER_PASSWORD) {
			console.info(
				`Registering user from environment variables: ${DEFAULT_USER_NAME}`,
			);
			// Add user registration process here
			const hashedPassword = await saltAndHashPassword(DEFAULT_USER_PASSWORD);
			resetCredentials(DEFAULT_USER_NAME, hashedPassword)
				.then((result) => {
					console.info("User created:", result);
					process.exit();
				})
				.catch((error) => {
					console.error("Error creating user:", error);
					process.exit();
				});
		} else {
			const answers = await inquirer.prompt([
				{
					type: "input",
					name: "username",
					message: "Type your username:",
				},
				{
					type: "password",
					name: "password",
					message: "Type your password:",
				},
			]);
			console.info(`Registering user: ${answers.username}`);
			// Add user registration process here
			const hashedPassword = await saltAndHashPassword(answers.password);
			resetCredentials(answers.username, hashedPassword)
				.then((result) => {
					console.info("User created:", result);
					process.exit();
				})
				.catch((error) => {
					console.error("Error creating user:", error);
					process.exit();
				});
		}
	});

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
