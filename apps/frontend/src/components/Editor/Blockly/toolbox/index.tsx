import * as Blockly from "blockly/core";

export * from "./category/index.js";

class CustomCategory extends Blockly.ToolboxCategory {
	/** @override */
	addColourBorder_(colour: string) {
		if (this.rowDiv_) {
			this.rowDiv_.style.paddingLeft = "0.5rem";
			this.rowDiv_.style.backgroundColor = colour;
		}
	}
	/** @override */
	setSelected(isSelected: boolean) {
		if (!this.rowDiv_) {
			return;
		}
		// We do not store the label span on the category, so use getElementsByClassName.
		const labelDom = this.rowDiv_.getElementsByClassName("blocklyTreeLabel")[0];
		if (isSelected === true) {
			// Change the background color of the div to white.
			this.rowDiv_.style.backgroundColor = "#fff7ed";
			// Set the colour of the text to the colour of the category.
			(labelDom as HTMLElement).style.color = this.colour_;
		} else {
			// Set the background back to the original colour.
			this.rowDiv_.style.backgroundColor = this.colour_ || "#transparent"; // default to transparent if no color
			// Set the text back to white.
			(labelDom as HTMLElement).style.color = "#fff7ed";
		}
		// This is used for accessibility purposes.
		Blockly.utils.aria.setState(
			this.htmlDiv_ as Element,
			Blockly.utils.aria.State.SELECTED,
			isSelected,
		);
		// Ensure nested categories maintain correct background
		if (this.htmlDiv_) {
			const nestedCategories = this.htmlDiv_.querySelectorAll(
				".blocklyToolboxCategory",
			);
			for (const category of nestedCategories) {
				(category as HTMLElement).style.backgroundColor =
					this.colour_ || "#transparent";
			}
		}
	}
}
//ネストしているカテゴリの背景色を変更する
class CustomCollapsibleCategory extends Blockly.CollapsibleToolboxCategory {
	/** @override */
	addColourBorder_(colour: string) {
		if (this.rowDiv_) {
			this.rowDiv_.style.paddingLeft = "0.5rem";
			this.rowDiv_.style.backgroundColor = colour;
		}
	}

	/** @override */
	setSelected(isSelected: boolean) {
		if (!this.rowDiv_) {
			return;
		}
		// We do not store the label span on the category, so use getElementsByClassName.
		const labelDom = this.rowDiv_.getElementsByClassName("blocklyTreeLabel")[0];
		if (isSelected === true) {
			// Change the background color of the div to white.
			this.rowDiv_.style.backgroundColor = "#fff7ed";
			// Set the colour of the text to the colour of the category.
			(labelDom as HTMLElement).style.color = this.colour_;
		} else {
			// Set the background back to the original colour.
			this.rowDiv_.style.backgroundColor = this.colour_ || "#transparent"; // default to transparent if no color
			// Set the text back to white.
			(labelDom as HTMLElement).style.color = "#fff7ed";
		}
		// This is used for accessibility purposes.
		Blockly.utils.aria.setState(
			this.htmlDiv_ as Element,
			Blockly.utils.aria.State.SELECTED,
			isSelected,
		);
	}
}

Blockly.registry.register(
	Blockly.registry.Type.TOOLBOX_ITEM,
	Blockly.ToolboxCategory.registrationName,
	CustomCategory,
	true,
);
Blockly.registry.register(
	Blockly.registry.Type.TOOLBOX_ITEM,
	Blockly.CollapsibleToolboxCategory.registrationName,
	CustomCollapsibleCategory,
	true,
);
