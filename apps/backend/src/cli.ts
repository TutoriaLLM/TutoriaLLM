//TutoriaLLM CLI

import { Command } from "commander";
import inquirer from "inquirer";
import fs from "node:fs";

import dotenv from "dotenv";
import { saltAndHashPassword } from "../utils/password.js";
import { resetCredentials } from "./db/users.js";
import { createConfig, deleteConfig } from "./modules/config/_index.js";

const program = new Command();
dotenv.config();

// ユーザー登録コマンド
program
	.command("register")
	.description(
		"Register a user. If the DEFAULT_USER_NAME and DEFAULT_USER_PASSWORD environment variables are set, they will be used.",
	)
	.action(async () => {
		const { DEFAULT_USER_NAME, DEFAULT_USER_PASSWORD } = process.env;

		if (DEFAULT_USER_NAME && DEFAULT_USER_PASSWORD) {
			console.log(
				`Registering user from environment variables: ${DEFAULT_USER_NAME}`,
			);
			// ここにユーザー登録処理を追加
			const hashedPassword = await saltAndHashPassword(DEFAULT_USER_PASSWORD);
			resetCredentials(DEFAULT_USER_NAME, hashedPassword)
				.then((result) => {
					console.log("User created:", result);
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
			console.log(`Registering user: ${answers.username}`);
			// ここにユーザー登録処理を追加
			const hashedPassword = await saltAndHashPassword(answers.password);
			resetCredentials(answers.username, hashedPassword)
				.then((result) => {
					console.log("User created:", result);
					process.exit();
				})
				.catch((error) => {
					console.error("Error creating user:", error);
					process.exit();
				});
		}
	});

// 初期化コマンド
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
			console.log("Initializing Config...");
			deleteConfig();
			createConfig();
			console.log("Config initialized.");
			process.exit();
		} else {
			console.log("Initialization canceled.");
			process.exit();
		}
	});

// .initializedを削除するコマンド
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
			console.log("Deleting .initialized...");
			if (fs.existsSync("/app_data/.initialized")) {
				fs.unlinkSync("/app_data/.initialized");
				console.log(".initialized deleted");
			} else {
				console.log(".initialized file does not exist.");
			}
		} else {
			console.log("Operation cancelled.");
		}
	});

// コマンドの解析と実行
program.parse(process.argv);
