import * as Blockly from "blockly";
import extensionModules, { type Locale, type Block } from "extensions"; // Import as default export
type AvailableBlock = {
	block: Block;
	code: () => void;
	locale: Locale;
};

const loadedExtensions = Object.values(extensionModules).flatMap(
	(mod) => mod.Blocks,
); // Flatten the Blocks property of each module and combine them into a single array

export function registerAvailableBlocks(
	availableBlocks: AvailableBlock[],
	language: string,
) {
	for (const { block, code, locale } of availableBlocks) {
		Blockly.Blocks[block.type] = {
			init: function () {
				this.jsonInit(block);
			},
		};

		code();

		if (locale?.[language]) {
			// Register if locale is described (json format)
			for (const key in locale[language]) {
				if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
					Blockly.Msg[key] = locale[language][key];
				}
			}
		}
	}
}

// Retrieve block files, retrieve available blocks, and register blocks in sequence
export function registerBlocks(language: string) {
	// Extract block, code, locale from module

	const availableBlocks: AvailableBlock[] = [];
	for (const module of loadedExtensions) {
		for (const mod of Object.values(module).flat()) {
			availableBlocks.push({
				block: mod.block,
				code: mod.code,
				locale: mod.locale,
			});
		}
	}
	registerAvailableBlocks(availableBlocks, language);
}

// Take only the block names and put them in an array
export async function getBlockNames() {
	const availableBlocks: AvailableBlock[] = [];
	for (const module of loadedExtensions) {
		for (const mod of Object.values(module).flat()) {
			availableBlocks.push({
				block: mod.block,
				code: mod.code,
				locale: mod.locale,
			});
		}
	}
	const blockNames = availableBlocks.map((block) => block.block.type);
	return blockNames;
}
