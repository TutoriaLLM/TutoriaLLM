import fs from "node:fs";
import path from "node:path";
import type { Context } from "node:vm";
import extensionModules from "extensions";
import glob from "fast-glob";
import ts from "typescript";

export function loadExtensions(context: Context): void {
	for (const [key, mod] of Object.entries(extensionModules)) {
		try {
			// `Context` が存在する場合のみ処理
			if ("Context" in mod) {
				for (const [ctxKey, ctxValue] of Object.entries(mod.Context)) {
					context[ctxKey] = ctxValue;
				}
			}
		} catch (error) {
			console.error(`Error loading extension ${key}:`, error);
		}
	}
}

export async function loadScript(): Promise<string | null> {
	async function findScriptFromModule(
		moduleName: string,
		fileName: string,
	): Promise<string | null> {
		const modulePath = path.join(process.cwd(), "node_modules", moduleName);
		//modulePathに存在するすべてのディレクトリ内からfileNameを探す
		const files = await glob(`**/${fileName}`, { cwd: modulePath });
		for (const file of files) {
			const scriptPath = path.join(modulePath, file);
			if (fs.existsSync(scriptPath)) {
				const scriptContent = fs.readFileSync(scriptPath, "utf-8");
				const result = ts.transpileModule(scriptContent, {
					compilerOptions: {
						module: ts.ModuleKind.ES2020,
						isolatedModules: true,
						target: ts.ScriptTarget.ES2020,
						removeComments: true,
					},
				});
				return result.outputText
					.replace(/^export /gm, "")
					.replace(/^import .* from .*$/gm, "");
			}
		}
		console.error(`Script not found in ${modulePath}`);
		return null;
	}

	const extScript = await findScriptFromModule("extensions", "script.ts");
	if (!extScript) {
		return null;
	}

	// `extScriptContent` を必要に応じて構築
	return extScript;
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

function removeImportsTransformer<T extends ts.Node>(
	context: ts.TransformationContext,
) {
	return (rootNode: T): T => {
		function visit(node: ts.Node): ts.Node {
			if (ts.isImportDeclaration(node)) {
				return undefined as any;
			}
			return ts.visitEachChild(node, visit, context);
		}
		return ts.visitNode(rootNode, visit) as T;
	};
}
