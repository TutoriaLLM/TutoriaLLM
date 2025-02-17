//TutoriaLLM CLI

import fs from "node:fs";
import { Command } from "commander";
import inquirer from "inquirer";

import { createConfig, deleteConfig } from "@/modules/config";
import { createUser, setRole } from "./libs/auth";

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
			//create .initialized file
			fs.writeFileSync("/app_data/.initialized", "");
			console.info(".initialized created");
			process.exit();
		} else {
			console.info("Initialization canceled.");
			process.exit();
		}
	});

program
	.command("register")
	.description(
		"Register a user. If the DEFAULT_USER_NAME and DEFAULT_USER_PASSWORD environment variables are set, they will be used.",
	)
	.action(async () => {
		const { DEFAULT_USER_NAME, DEFAULT_USER_PASSWORD } = process.env;

		const credentials =
			DEFAULT_USER_NAME && DEFAULT_USER_PASSWORD
				? { username: DEFAULT_USER_NAME, password: DEFAULT_USER_PASSWORD }
				: await inquirer.prompt([
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

		console.info(`Registering user: ${credentials.username}`);

		const { role } = await inquirer.prompt([
			{
				type: "list",
				name: "role",
				message: "Select your role:",
				choices: ["user", "admin"],
				default: "user",
			},
		]);

		createUser({
			email: `${credentials.username}@example.com`,
			password: credentials.password,
			displayName: credentials.username,
			username: credentials.username,
		})
			.then(async (result) => {
				console.info("User created: ", result.user);
				await setRole({ userId: result.user.id, role });
				console.info("Role set: ", role);
				process.exit();
			})
			.catch((error) => {
				console.error("Error creating user:", error);
				process.exit();
			});
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
