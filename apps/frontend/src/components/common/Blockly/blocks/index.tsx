import * as Blockly from "blockly";
import extensionModules from "extensions";

const loadedExtensions = Object.values(extensionModules).flatMap(
	(mod) => mod.Blocks,
); // Flatten the Blocks property of each module and combine them into a single array

const loadedBlocks = loadedExtensions.flatMap((module) =>
	Object.values(module).flat(),
);

function registerBlocks(language: string) {
	for (const module of loadedBlocks) {
		if (module && typeof module === "object") {
			const { block, code, locale } = module;

			if (block) {
				Blockly.Blocks[block.type] = {
					init: function () {
						this.jsonInit(block);

						// Call the `customInit` method if it is defined.
						if (typeof block.customInit === "function") {
							block.customInit.call(this);
						}
					},
				};

				if (code) {
					// If there is a function to register code, execute it.
					code();
				}

				if (locale?.[language]) {
					// Register if locale is described (json format)
					for (const key in locale[language]) {
						if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
							Blockly.Msg[key] = locale[language][key];
						}
					}
				} else {
					// Register English if locale is not described
					for (const key in locale?.en) {
						if (Object.prototype.hasOwnProperty.call(locale.en, key)) {
							Blockly.Msg[key] = locale.en[key];
						}
						// Outputs an error if English is not also registered
						if (!locale?.en) {
							console.error("No English locale found for", module);
						}
					}
				}
			}
		} else {
			console.warn("Module is not an object or is undefined", module);
		}
	}
}

export function getExternalBlocks() {
	// Get a list of extension blocks available on the front end
	// Create a list with only blocks from a module with block, code, and locale
	const blockList: string[] = [];
	const availableBlocks = loadedBlocks.map((module: any) => module);
	for (const block of availableBlocks) {
		blockList.push(block.block.type);
	}
	return blockList;
}

export default registerBlocks;
