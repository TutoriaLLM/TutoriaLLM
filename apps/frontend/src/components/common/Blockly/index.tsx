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
import { ToolboxHighlighter } from "./toolboxHighlight";

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
	setBlockNameToHighlight,
	blockIdToHighlight,
	setBlockIdToHighlight,
	onWorkspaceChange,
	workspaceJson,
	setWorkspaceJson,
}: {
	language?: string;
	workspaceConfiguration?: Blockly.BlocklyOptions;
	toolboxConfiguration?: Blockly.utils.toolbox.ToolboxDefinition;
	isMenuOpen: boolean;
	blockNameToHighlight?: string | null;
	setBlockNameToHighlight?: (blockName: string | null) => void;
	blockIdToHighlight?: string | null;
	setBlockIdToHighlight?: (blockId: string | null) => void;
	onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
	workspaceJson?: object;
	setWorkspaceJson?: (json: object | null) => void;
}) => {
	const blocklyDiv = useRef<HTMLDivElement | null>(null);
	const blockHighlightRef = useRef<BlockHighlight | null>(null);
	const toolboxHighlighterRef = useRef<ToolboxHighlighter | null>(null);

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
		if (workspace) {
			if (!toolboxHighlighterRef.current) {
				toolboxHighlighterRef.current = new ToolboxHighlighter(
					workspace,
					setBlockNameToHighlight
						? () => setBlockNameToHighlight(null)
						: () => {},
				);
			}

			if (blockNameToHighlight) {
				toolboxHighlighterRef.current.highlightBlock(blockNameToHighlight);
			} else {
				toolboxHighlighterRef.current.disposeHighlight();
			}
		}
		return () => {
			if (toolboxHighlighterRef.current) {
				toolboxHighlighterRef.current.disposeHighlight();
				toolboxHighlighterRef.current = null;
			}
		};
	}, [blockNameToHighlight, workspace]);

	//highlight specified block by id
	useEffect(() => {
		const onUserMovedTargetBlock = (event: Blockly.Events.Abstract) => {
			if (event.type === Blockly.Events.MOVE) {
				const moveEvent = event as Blockly.Events.BlockMove;
				if (moveEvent.blockId === blockIdToHighlight) {
					blockHighlightRef.current?.dispose();
					setBlockIdToHighlight ? setBlockIdToHighlight(null) : null;
				}
			}
		};

		workspace?.addChangeListener(onUserMovedTargetBlock);

		if (blockHighlightRef.current) {
			blockHighlightRef.current.dispose();
		}

		if (blockIdToHighlight && workspace) {
			blockHighlightRef.current = new BlockHighlight(workspace);
			blockHighlightRef.current.init(10, blockIdToHighlight);
		} else {
			blockHighlightRef.current = null;
		}

		return () => {
			workspace?.removeChangeListener(onUserMovedTargetBlock);
		};
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

	const internalUpdateRef = useRef(false);

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
		(newWorkspace: Blockly.WorkspaceSvg) => {
			if (onWorkspaceChange) {
				onWorkspaceChange(newWorkspace);
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
				internalUpdateRef.current = true;
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
		if (internalUpdateRef.current) {
			internalUpdateRef.current = false;
			return;
		}
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
