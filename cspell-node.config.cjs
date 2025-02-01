const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

/**
 * Search for `pnpm-workspace.yaml`.
 * @param {string} from - The directory from which to start the search.
 * @returns {string|undefined} - The path to `pnpm-workspace.yaml`, or undefined if not found.
 */
function findNearestWorkspaceYaml(from) {
	const startDir = path.resolve(from);
	const parent = path.dirname(startDir);

	if (!startDir || parent === startDir) {
		return;
	}

	const workspaceFile = path.join(startDir, "pnpm-workspace.yaml");
	if (fs.existsSync(workspaceFile)) {
		return workspaceFile;
	}
	return findNearestWorkspaceYaml(parent);
}

/**
 * Load the nearest `pnpm-workspace.yaml`.
 * @param {string} cwd - The working directory path.
 * @returns {object|undefined} - The loaded content, or undefined if file not found.
 */
function loadWorkspaceConfig(cwd) {
	const workspaceFile = findNearestWorkspaceYaml(cwd);
	if (!workspaceFile) return;
	return yaml.load(fs.readFileSync(workspaceFile, "utf-8"));
}

/**
 * Retrieve workspace packages based on a pattern.
 * @param {string} cwd - The working directory.
 * @param {object} workspaceConfig - Workspace configuration.
 * @returns {string[]} - An array of package directories.
 */
const getWorkspaces = (cwd, workspaceConfig) => {
	if (!workspaceConfig?.packages) return [];

	return workspaceConfig.packages.flatMap((pattern) => {
		// Ignore negative patterns (starting with '!')
		if (pattern.startsWith("!")) return [];

		const globPattern = pattern.endsWith("/*") ? pattern.slice(0, -2) : pattern;
		try {
			return fs
				.readdirSync(path.join(cwd, globPattern), { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => path.join(cwd, globPattern, dirent.name));
		} catch (error) {
			console.warn(`Failed to read directory for pattern ${pattern}:`, error);
			return [];
		}
	});
};

/**
 * Load package.json from a specific directory.
 * @param {string} dir - The directory path.
 * @returns {object} - The contents of the loaded package.json, or an empty object.
 */
function loadPackageJson(dir) {
	const pkgPath = path.join(dir, "package.json");
	try {
		if (fs.existsSync(pkgPath)) {
			return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
		}
	} catch (error) {
		console.warn(`Failed to load package.json from ${dir}:`, error);
	}
	return {};
}

/**
 * Determine package names and additional methods from the current workspace.
 * @param {string} [cwd=process.cwd()] - The directory to start searching.
 * @returns {string[]} - A list of collected package names.
 */
function determinePackageNamesAndMethods(cwd = process.cwd()) {
	const workspaceConfig = loadWorkspaceConfig(cwd) || {};
	const workspaces = getWorkspaces(cwd, workspaceConfig);

	// Load the root package.json and retrieve its dependencies
	const rootPackage = loadPackageJson(cwd);
	const rootPackageNames = Object.keys(rootPackage.dependencies || {}).concat(
		Object.keys(rootPackage.devDependencies || {}),
	);

	// For each workspace, load the package.json and retrieve its dependencies
	const workspacePackageNames = workspaces.flatMap((workspacePath) => {
		const pkg = loadPackageJson(workspacePath);
		return [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
		];
	});

	// Collect unique package names
	const nameSet = new Set();
	for (const packageName of [...rootPackageNames, ...workspacePackageNames]) {
		// 例: "@scope/library" -> ["scope", "library"]
		nameSet.add(...packageName.replace("@", "").split("/"));
	}

	// If there are catalog entries in the workspace configuration, add them
	if (workspaceConfig.catalog) {
		for (const name of Object.keys(workspaceConfig.catalog)) {
			nameSet.add(name);
		}
	}

	return [...nameSet];
}

module.exports = {
	words: determinePackageNamesAndMethods(),
};
