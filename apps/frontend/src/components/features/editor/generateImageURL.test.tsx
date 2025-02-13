import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import getImageFromSerializedWorkspace from "./generateImageURL";
import * as Blockly from "blockly";
import { workspaceToPngBase64 } from "@/libs/workspaceToPng";
import registerBlocks from "@/components/common/Blockly/blocks";
import { blocklyLocale } from "@/i18n/blocklyLocale";

vi.mock("@/components/common/Blockly/blocks/index.js", () => ({
	default: vi.fn(),
}));
vi.mock("@/libs/workspaceToPng.js", () => ({
	workspaceToPngBase64: vi.fn(),
}));
vi.mock("blockly", () => ({
	inject: vi.fn(),
	setLocale: vi.fn(),
	serialization: {
		workspaces: {
			load: vi.fn(),
		},
	},
}));

describe("getImageFromSerializedWorkspace", () => {
	let hiddenWorkspaceRef: { current: Blockly.WorkspaceSvg | null };
	let hiddenDivRef: { current: HTMLDivElement | null };

	beforeEach(() => {
		hiddenWorkspaceRef = { current: null };
		hiddenDivRef = { current: null };
		vi.clearAllMocks();
	});

	it("should create a hidden workspace and return the image URL", () => {
		const serializedWorkspace = { some: "data" };
		const language = "en";
		const mockImageURL = "data:image/png;base64,xyz";
		(workspaceToPngBase64 as Mock).mockReturnValue(mockImageURL);

		const result = getImageFromSerializedWorkspace(
			serializedWorkspace,
			language,
			hiddenWorkspaceRef,
			hiddenDivRef,
		);

		expect(registerBlocks).toHaveBeenCalledWith(language);
		expect(Blockly.inject).toHaveBeenCalled();
		expect(Blockly.setLocale).toHaveBeenCalledWith(blocklyLocale[language]);
		expect(Blockly.serialization.workspaces.load).toHaveBeenCalledWith(
			serializedWorkspace,
			hiddenWorkspaceRef.current,
		);
		expect(workspaceToPngBase64).toHaveBeenCalledWith(
			hiddenWorkspaceRef.current,
		);
		expect(result).toBe(mockImageURL);
	});

	it("should reuse the existing hidden workspace and return the image URL", () => {
		const serializedWorkspace = { some: "data" };
		const language = "en";
		const mockImageURL = "data:image/png;base64,xyz";
		const mockWorkspace = {} as Blockly.WorkspaceSvg;
		hiddenWorkspaceRef.current = mockWorkspace;
		(workspaceToPngBase64 as Mock).mockReturnValue(mockImageURL);

		const result = getImageFromSerializedWorkspace(
			serializedWorkspace,
			language,
			hiddenWorkspaceRef,
			hiddenDivRef,
		);

		expect(registerBlocks).toHaveBeenCalledWith(language);
		expect(Blockly.inject).not.toHaveBeenCalled();
		expect(Blockly.setLocale).not.toHaveBeenCalled();
		expect(Blockly.serialization.workspaces.load).toHaveBeenCalledWith(
			serializedWorkspace,
			hiddenWorkspaceRef.current,
		);
		expect(workspaceToPngBase64).toHaveBeenCalledWith(
			hiddenWorkspaceRef.current,
		);
		expect(result).toBe(mockImageURL);
	});
});
