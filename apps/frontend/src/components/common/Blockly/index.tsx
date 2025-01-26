import { useEffect, useRef } from "react";
import * as Blockly from "blockly/core";
import Theme from "./theme";
import { useState, useCallback } from "react";
import type { Workspace, WorkspaceSvg } from "blockly";
import { toolboxCategories, translateCategories } from "./toolbox";
import "@/styles/blockly.css";
import registerBlocks from "./blocks";
import { BlockHighlight } from "./blockHighlight";
import { blocklyLocale } from "@/i18n/blocklyLocale";

export const defaultBlocklyOptions: Blockly.BlocklyOptions = {
	toolbox: toolboxCategories,
	sounds: false,
	theme: Theme,
	renderer: "zelos",
	media: "/",
	zoom: {
		controls: true,
		wheel: true,
		startScale: 1.0,
		maxScale: 3,
		minScale: 0.3,
		scaleSpeed: 1.2,
	},
	trashcan: false,
	move: {
		scrollbars: true,
		drag: true,
		wheel: true,
	},
	grid: {
		spacing: 20,
		length: 3,
		colour: "#ccc",
		snap: true,
	},
};

const relevantChangeTypes = new Set<string>([
	// ブロック関連
	Blockly.Events.BLOCK_CHANGE,
	Blockly.Events.BLOCK_MOVE,
	Blockly.Events.BLOCK_DELETE,
	// コメント関連
	Blockly.Events.COMMENT_CREATE,
	Blockly.Events.COMMENT_CHANGE,
	Blockly.Events.COMMENT_MOVE,
	Blockly.Events.COMMENT_DELETE,
	// 変数関連
	Blockly.Events.VAR_CREATE,
	Blockly.Events.VAR_DELETE,
	Blockly.Events.VAR_RENAME,
]);

function isRelevantChange(event: Blockly.Events.Abstract): boolean {
	if (event.type === Blockly.Events.MOVE) {
		const moveEvent = event as Blockly.Events.BlockMove;
		if (Array.isArray(moveEvent.reason)) {
			if (moveEvent.reason.includes("disconnect")) {
				return false;
			}
		}
	}
	return relevantChangeTypes.has(event.type);
}

export const BlocklyEditor = ({
	language,
	workspaceConfiguration = defaultBlocklyOptions,
	toolboxConfiguration = toolboxCategories,
	isMenuOpen = true,
	blockNameToHighlight,
	blockIdToHighlight,
	onWorkspaceChange,
	workspaceJson,
	setWorkspaceJson,
}: {
	language?: string;
	workspaceConfiguration?: Blockly.BlocklyOptions;
	toolboxConfiguration?: Blockly.utils.toolbox.ToolboxDefinition;
	isMenuOpen: boolean;
	blockNameToHighlight?: string | null;
	blockIdToHighlight?: string | null;
	onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
	workspaceJson?: object;
	setWorkspaceJson?: (json: object | null) => void;
}) => {
	const blocklyDiv = useRef<HTMLDivElement | null>(null);
	const blockHighlightRef = useRef<BlockHighlight | null>(null);

	const { workspace } = useBlocklyWorkspace({
		workspaceJson,
		setWorkspaceJson,
		ref: blocklyDiv,
		workspaceConfiguration,
		toolboxConfiguration,
		onWorkspaceChange,
	});

	registerBlocks(language ?? "en");
	translateCategories(language ?? "en");

	useEffect(() => {
		if (language && blocklyLocale[language]) {
			Blockly.setLocale(blocklyLocale[language]);
		} else {
			Blockly.setLocale(blocklyLocale.en);
		}
		//Confirm that ResizeObserver is available and blocklyDiv.current exists
		if (typeof ResizeObserver !== "undefined" && blocklyDiv.current) {
			const observer = new ResizeObserver(() => {
				workspace?.resize();
				if (workspace) Blockly.svgResize(workspace);
			});

			observer.observe(blocklyDiv.current);

			// Disconnect the observer when the component is unmounted
			return () => {
				observer.disconnect();
			};
		}
	}, [workspace]);

	useEffect(() => {
		if (blockNameToHighlight && workspace) {
			// Function to highlight a category and its parent categories
			function highlightCategory(category: Blockly.ToolboxCategory) {
				const div = category.getDiv();
				const labelDOM = div?.getElementsByClassName(
					"blocklyTreeRow",
				)[0] as HTMLElement;
				if (labelDOM) {
					labelDOM.style.backgroundColor = "#ef4444";
					labelDOM.classList.add("highlight"); // highlight is defined in the CSS file
				}
			}
			// Function to highlight everything up to the top level hierarchy
			function highlightParentCategory(category: Blockly.ToolboxCategory) {
				let parent = category.getParent();
				while (parent) {
					const parentCategory = parent as Blockly.CollapsibleToolboxCategory;
					parent = parentCategory.getParent();
					highlightCategory(parentCategory);
					highlightParentCategory(parentCategory);
				}
			}

			function containsBlockType(
				contents: Blockly.utils.toolbox.FlyoutItemInfoArray,
				blockType: string,
			): boolean {
				for (const content of contents) {
					// Checks if content is a block and has a type property
					if (
						content.kind === "block" &&
						"type" in content &&
						content.type === blockType
					) {
						return true;
					}
				}
				return false;
			}

			// Highlight the menu item in the toolbox item to be highlighted, if any
			const toolboxItem = (
				workspace.getToolbox() as Blockly.Toolbox
			).getToolboxItems();

			for (const item of toolboxItem) {
				if (item.isSelectable()) {
					const category = item as
						| Blockly.ToolboxCategory
						| Blockly.CollapsibleToolboxCategory;

					const contents = category.getContents();
					if (
						typeof contents !== "string" &&
						blockNameToHighlight &&
						containsBlockType(contents, blockNameToHighlight)
					) {
						// If the category name matches, change the color of that category
						highlightCategory(category);
					}
				}
				if (item.isCollapsible()) {
					const category = item as Blockly.CollapsibleToolboxCategory;
					// Retrieve child items
					const children = category.getChildToolboxItems();
					for (const child of children) {
						const item = child as Blockly.ToolboxCategory;
						const contents = item.getContents();
						if (
							typeof contents !== "string" &&
							blockNameToHighlight &&
							containsBlockType(contents, blockNameToHighlight)
						) {
							// If the category name matches, change the color of that category
							highlightCategory(item);
							// Also change the color of the parent category
							highlightParentCategory(item);
						}
					}
					const contents = category.getContents();
					if (
						typeof contents !== "string" &&
						blockNameToHighlight &&
						containsBlockType(contents, blockNameToHighlight)
					) {
						// If the category name matches, change the color of that category
						highlightCategory(category);
					}
				}
			}
		}
	}, [blockNameToHighlight, workspace]);

	//highlight specified block by id
	useEffect(() => {
		if (blockHighlightRef.current) {
			blockHighlightRef.current.dispose();
		}

		if (blockIdToHighlight && workspace) {
			blockHighlightRef.current = new BlockHighlight(workspace);
			blockHighlightRef.current.init(10, blockIdToHighlight);
		} else {
			blockHighlightRef.current = null;
		}
	}, [blockIdToHighlight, workspace]);

	// Hide/Show toolbox
	useEffect(() => {
		if (workspace) {
			workspace.getToolbox()?.setVisible(isMenuOpen);
			workspace.getToolbox()?.getFlyout()?.setVisible(isMenuOpen);
		}
	}, [isMenuOpen, workspace]);

	return <div className="w-full h-full relative" ref={blocklyDiv} />;
};

function loadFromJson(
	json: object,
	workspace: Workspace,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onImportError?: (error: any) => void,
) {
	try {
		Blockly.serialization.workspaces.load(json, workspace);
		return true;
	} catch (e) {
		if (onImportError) {
			onImportError(e);
		}
		return false;
	}
}

//上流のstateを受け取るってことだよね？
const useBlocklyWorkspace = ({
	ref,
	workspaceJson,
	setWorkspaceJson,
	toolboxConfiguration,
	workspaceConfiguration,
	onWorkspaceChange,
	onImportError,
}: {
	ref: React.MutableRefObject<HTMLDivElement | null>;
	workspaceJson?: object;
	setWorkspaceJson?: (json: object | null) => void;
	workspaceConfiguration: Blockly.BlocklyOptions;
	toolboxConfiguration?: Blockly.utils.toolbox.ToolboxDefinition;
	onWorkspaceChange?: (_workspace: Blockly.WorkspaceSvg) => void;
	onImportError?: (error: any) => void;
}): {
	workspace: Blockly.WorkspaceSvg | null;
	json: object | null;
} => {
	const [workspace, setWorkspace] = useState<WorkspaceSvg | null>(null);

	const [didHandleNewWorkspace, setDidHandleNewWorkspace] = useState(false);

	const workspaceConfigurationRef = useRef(workspaceConfiguration);

	useEffect(() => {
		workspaceConfigurationRef.current = workspaceConfiguration;
	}, [workspaceConfiguration]);

	const toolboxConfigurationRef = useRef(toolboxConfiguration);

	useEffect(() => {
		toolboxConfigurationRef.current = toolboxConfiguration;
		if (toolboxConfiguration && workspace && !workspaceConfiguration.readOnly) {
			workspace.updateToolbox(toolboxConfiguration);
		}
	});

	const handleWorkspaceChanged = useCallback(
		(newWorksapce: Blockly.WorkspaceSvg) => {
			if (onWorkspaceChange) {
				onWorkspaceChange(newWorksapce);
			}
		},
		[onWorkspaceChange],
	);

	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const newWorkspace = Blockly.inject(
			ref.current,
			workspaceConfigurationRef.current,
		);

		setWorkspace(newWorkspace);
		setDidHandleNewWorkspace(false);

		return () => {
			newWorkspace.dispose();
		};
	}, [ref]);

	// Send workspace change event when its changed
	useEffect(() => {
		if (workspace && !didHandleNewWorkspace) {
			handleWorkspaceChanged(workspace);
		}
	}, [handleWorkspaceChanged, didHandleNewWorkspace, workspace]);

	// call handleWorkspaceChanged when its changed

	useEffect(() => {
		if (workspace === null) {
			return undefined;
		}

		const listener = (event: Blockly.Events.Abstract) => {
			Blockly.Events.disableOrphans(event);

			if (isRelevantChange(event)) {
				handleWorkspaceChanged(workspace);
			}
		};

		workspace.addChangeListener(listener);

		return () => {
			workspace.removeChangeListener(listener);
		};
	}, [workspace, handleWorkspaceChanged]);

	useEffect(() => {
		if (workspace === null) {
			return undefined;
		}

		const callback = (event: Blockly.Events.Abstract) => {
			if (isRelevantChange(event) && setWorkspaceJson) {
				const newJson = Blockly.serialization.workspaces.save(workspace);
				setWorkspaceJson(newJson);
			}
		};

		workspace.addChangeListener(callback);

		return () => {
			workspace.removeChangeListener(callback);
		};
	}, [workspace, setWorkspaceJson]);

	useEffect(() => {
		if (workspaceJson && workspace) {
			const currentWorkspaceJson =
				Blockly.serialization.workspaces.save(workspace);
			if (
				JSON.stringify(currentWorkspaceJson) !== JSON.stringify(workspaceJson)
			) {
				const success = loadFromJson(workspaceJson, workspace, onImportError);
				if (!success && setWorkspaceJson) {
					setWorkspaceJson(null);
				}
			}
		}
	}, [workspaceJson, workspace, onImportError, setWorkspaceJson]);

	return {
		workspace,
		json: workspaceJson ?? null,
	};
};
