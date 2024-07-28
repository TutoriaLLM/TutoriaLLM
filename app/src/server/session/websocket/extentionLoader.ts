import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Context } from "node:vm";

export class ExtensionLoader {
	private extensionsDir: string;

	constructor(extensionsDir: string) {
		this.extensionsDir = extensionsDir;
	}

	public async loadExtensions(context: Context): Promise<void> {
		const extensionFolders = fs.readdirSync(this.extensionsDir);

		for (const extensionFolder of extensionFolders) {
			const ctxDir = path.join(this.extensionsDir, extensionFolder, "context");
			if (fs.existsSync(ctxDir) && fs.lstatSync(ctxDir).isDirectory()) {
				const files = fs.readdirSync(ctxDir);
				for (const file of files) {
					const filePath = path.join(ctxDir, file);
					const fileURL = pathToFileURL(filePath).href;
					const mod = await import(fileURL);
					if (typeof mod.default === "function") {
						console.log("loading extension", file);
						context[path.basename(file, path.extname(file))] = mod.default;
					}
				}
			}
		}
	}

	public async loadScript(): Promise<string | null> {
		function findScriptFiles(dir: string): string[] {
			let results: string[] = [];
			const list = fs.readdirSync(dir);

			for (const file of list) {
				const filePath = path.join(dir, file);
				const stat = fs.lstatSync(filePath);
				if (stat?.isDirectory()) {
					results = results.concat(findScriptFiles(filePath));
				} else if (file === "script.ts" || file === "script.js") {
					results.push(filePath);
				}
			}
			return results;
		}

		const scriptFiles = findScriptFiles(this.extensionsDir);
		let ExtscriptContent = "";
		for (const scriptFile of scriptFiles) {
			const scriptContent = fs.readFileSync(scriptFile, "utf-8");
			// Optionally, add a check here to ensure the content contains a default function export
			console.log("loading extension script", scriptFile);
			ExtscriptContent += scriptContent;
		}
		return ExtscriptContent;
	}
}
