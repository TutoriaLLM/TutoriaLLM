import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Context } from "node:vm";
import ts from "typescript";

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
		console.log("loading script...");
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
		let extScriptContent = "";

		for (const scriptFile of scriptFiles) {
			const scriptContent = fs.readFileSync(scriptFile, "utf-8");
			console.log("loading extension script", scriptFile);

			const result = ts.transpileModule(scriptContent, {
				compilerOptions: {
					module: ts.ModuleKind.ES2020, // ES Module形式の出力に変更
					isolatedModules: true,
					target: ts.ScriptTarget.ES2020,
					removeComments: true,
				},
			});

			// モジュール関連のコードを削除
			const cleanedCode = result.outputText
				.replace(/^export /gm, "")
				.replace(/^import .* from .*$/gm, "");

			extScriptContent += cleanedCode;
		}

		return extScriptContent;
	}
}

function removeImportsTransformer<T extends ts.Node>(
	context: ts.TransformationContext,
) {
	return (rootNode: T): T => {
		function visit(node: ts.Node): ts.Node {
			// Import 宣言を削除
			if (ts.isImportDeclaration(node)) {
				return undefined as any;
			}
			// 他のノードを再帰的に処理
			return ts.visitEachChild(node, visit, context);
		}
		return ts.visitNode(rootNode, visit) as T;
	};
}

export function transpileWithRemoveImports(source: string): string {
	const result = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
		},
		transformers: {
			before: [removeImportsTransformer],
		},
	});
	return result.outputText;
}
