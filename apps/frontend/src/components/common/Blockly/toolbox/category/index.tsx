import * as Blockly from "blockly";

import basicModules from "@/components/common/Blockly/toolbox/category/basics/blocks";
import separator from "@/components/common/Blockly/toolbox/category/basics/separator";
import extensionModules from "extensions";

const loadedToolbox = Object.values(extensionModules).flatMap(
	(mod) => mod.Toolbox,
);

// Import basic categories
const loadedBasicModules = Object.values(basicModules).map((mod) => mod);

// Combine modules.
const combinedModules = [...loadedBasicModules, separator, ...loadedToolbox];
const loadExtensions = () => {
	const extensions = Object.values(combinedModules);
	return extensions.map((mod) => mod);
};

const loadedExtensions = loadExtensions();

// Extract categories and separators only
const categoryContents = loadedExtensions
	.filter(
		(ext) => ext && (("category" in ext && ext.category) || ext === separator),
	) // Confirm existence of ext and ext.category
	.map((ext) => (ext === separator ? ext : "category" in ext && ext.category)) // If ext is a separator, leave it as is; otherwise, take out category.
	.filter((ext) => ext !== false); // Function to translate a category

//same as extensions package
type Locale = {
	[key: string]: Record<string, string>;
	en: Record<string, string>;
};

export function translateCategories(language: string) {
	for (const ext of loadedExtensions.filter((ext) => ext && "locale" in ext)) {
		const locale = ext.locale as Locale;
		if (locale[language]) {
			// Register if locale is described (json format)
			for (const key in locale[language]) {
				if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
					Blockly.Msg[key] = locale[language][key];
				}
			}
		} else {
			// Register English if locale is not described
			// biome-ignore lint/style/useCollapsedElseIf: Not working without else if
			if (locale.en) {
				for (const key in ext.locale?.en) {
					if (Object.prototype.hasOwnProperty.call(ext.locale.en, key)) {
						Blockly.Msg[key] = locale.en[key];
					}
				}
			}
			// Outputs an error if English is not also registered
			else {
				console.error(`locale not found in ${ext}`);
			}
		}
	}
}

export const toolboxCategories = {
	kind: "categoryToolbox",
	contents: categoryContents,
} satisfies Blockly.utils.toolbox.ToolboxItemInfo;

export default toolboxCategories;
