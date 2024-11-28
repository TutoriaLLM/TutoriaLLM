import { Project } from "ts-morph";
import * as path from "node:path";

const project = new Project({
	tsConfigFilePath: "./tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.ts");

console.log(`処理を開始します。対象ファイル数: ${sourceFiles.length} ファイル`);

let updatedFiles = 0;

for (const sourceFile of sourceFiles) {
	let fileUpdated = false;
	const importDeclarations = sourceFile.getImportDeclarations();

	for (const importDeclaration of importDeclarations) {
		const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
		let newPath = moduleSpecifier;
		let shouldUpdate = false;

		// 相対パス（./ または ../ で始まる）の場合に@エイリアスに変換
		if (moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../")) {
			const currentDir = path.dirname(sourceFile.getFilePath());
			const targetFile = importDeclaration.getModuleSpecifierSourceFile();

			if (targetFile) {
				const absolutePath = targetFile.getFilePath();
				const projectRoot = project.getDirectoryOrThrow("./src").getPath();

				// プロジェクトルートからの相対パスを取得
				const relativePath = path
					.relative(projectRoot, absolutePath)
					.replace(/\\/g, "/");

				// @/path 形式に変換
				newPath = `@/${relativePath}`;
				shouldUpdate = true;
			} else {
				// ターゲットファイルが見つからない場合は、現在のモジュール指定子を使用
				// .js などの拡張子を含むパスの処理
				const resolvedPath = path.resolve(currentDir, moduleSpecifier);
				const relativeToSrc = path
					.relative(
						project.getDirectoryOrThrow("./src").getPath(),
						resolvedPath,
					)
					.replace(/\\/g, "/");
				newPath = `@/${relativeToSrc}`;
				shouldUpdate = true;
			}

			// 拡張子を削除
			newPath = newPath.replace(/\.(js|ts|jsx|tsx)$/, "");
		}

		// /index で終わるパスの処理（@エイリアスを使用している場合も含む）
		if (newPath.endsWith("/index")) {
			newPath = newPath.replace(/\/index$/, "");
			shouldUpdate = true;
		}

		// パスが変更されている場合のみ更新
		if (shouldUpdate && moduleSpecifier !== newPath) {
			importDeclaration.setModuleSpecifier(newPath);
			fileUpdated = true;
			console.log(`  ${moduleSpecifier} → ${newPath}`);
		}
	}

	if (fileUpdated) {
		sourceFile.saveSync();
		updatedFiles++;
		console.log(`更新: ${sourceFile.getFilePath()}`);
	}
}

console.log(`処理完了！更新されたファイル数: ${updatedFiles} ファイル`);
