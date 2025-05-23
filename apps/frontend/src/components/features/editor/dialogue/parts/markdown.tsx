import { getExternalBlocks } from "@/components/common/Blockly/blocks/index.js";
import {
	HighlightedBlockId,
	HighlightedBlockName,
} from "@/components/features/editor/dialogue/parts/highlight";
import { toast } from "@/hooks/toast";
import {
	blockNameFromMenuState,
	currentTabState,
	highlightedBlockState,
} from "@/state.js";
import type { SessionValue } from "@/type.js";
import { listAllBlocks } from "@/utils/blockList.js";
import type { TFunction } from "i18next";
import { useAtom, useSetAtom } from "jotai";
import { Copy } from "lucide-react";
import React, { useCallback } from "react";
import type { Components } from "react-markdown";

// Function to highlight text
function highlightText(
	node: React.ReactNode,
	allBlocks: string[],
	blockIdList: string[],
): React.ReactNode {
	const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
		blockNameFromMenuState,
	);
	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);
	const setActiveTab = useSetAtom(currentTabState);

	const handleBlockNameClick = useCallback(
		(blockName: string) => {
			if (blockNameFromMenu === blockName) {
				setBlockNameFromMenu(null);
			} else {
				setBlockNameFromMenu(blockName);
				setHighlightedBlock(null);
				setActiveTab("workspaceTab");
			}
		},
		[
			blockNameFromMenu,
			setBlockNameFromMenu,
			setHighlightedBlock,
			setActiveTab,
		],
	);

	const handleHighlightClick = useCallback(
		(blockId: string) => {
			if (highlightedBlock === blockId) {
				setHighlightedBlock(null);
			} else {
				setHighlightedBlock(blockId);
				setBlockNameFromMenu(null);
				setActiveTab("workspaceTab");
			}
		},
		[highlightedBlock, setHighlightedBlock, setBlockNameFromMenu, setActiveTab],
	);

	if (typeof node === "string" || typeof node === "number") {
		const text = node.toString();
		const regex = new RegExp(
			`(${[...allBlocks, ...blockIdList].map(escapeRegExp).join("|")})`,
			"g",
		);

		function escapeRegExp(string: string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}

		const parts = text.split(regex);

		return parts.map((part, index) => {
			if (allBlocks.includes(part)) {
				return (
					<HighlightedBlockName
						key={index}
						text={part}
						handleBlockNameClick={handleBlockNameClick}
					/>
				);
			}
			if (blockIdList.includes(part)) {
				return (
					<HighlightedBlockId
						key={index}
						text={part}
						handleBlockIdClick={handleHighlightClick}
					/>
				);
			}
			return part;
		});
	}

	if (React.isValidElement(node) && node.props.children) {
		return React.cloneElement(
			node,
			{ ...node.props },
			highlightText(node.props.children, allBlocks, blockIdList),
		);
	}

	if (Array.isArray(node)) {
		return node.map((child) => highlightText(child, allBlocks, blockIdList));
	}

	return node;
}

// Function to return markdownComponents
function getMarkdownComponents(
	t: TFunction,
	workspace: SessionValue["workspace"] | undefined,
) {
	const externalBlocks = () => getExternalBlocks();
	const allBlocks = () => listAllBlocks(externalBlocks());

	const blockIdList = (() => {
		const extractIdsRecursively = (obj: any): string[] => {
			let ids: string[] = [];
			if (obj && typeof obj === "object" && "id" in obj) {
				ids.push(obj.id);
			}
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const value = obj[key];
					if (typeof value === "object" && value !== null) {
						if (Array.isArray(value)) {
							for (const item of value) {
								ids = ids.concat(extractIdsRecursively(item));
							}
						} else {
							ids = ids.concat(extractIdsRecursively(value));
						}
					}
				}
			}
			return ids;
		};
		return workspace ? extractIdsRecursively(workspace) : [];
	})();
	const handleCodeCopy = (code: string) => {
		navigator.clipboard.writeText(code).then(() => {
			toast({
				description: t("toast.copiedToClipboard"),
			});
		});
	};

	const renderWithHighlight = (node: any, props: any) => {
		const highlightedChildren = highlightText(
			props.children,
			allBlocks(),
			blockIdList,
		);
		return node
			? React.createElement(node.tagName, props, highlightedChildren)
			: null;
	};

	const markdownComponents: Components = {
		strong({ node, className, children, ...props }) {
			const hasNonTextChildren = React.Children.toArray(children).some(
				(child) => typeof child !== "string",
			);

			if (hasNonTextChildren) {
				return <>{children}</>;
			}

			const text = String(children);
			return (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<span
					className="cursor-pointer text-primary underline"
					onClick={() => handleCodeCopy(text)}
				>
					<code className={className} {...props}>
						{children}
						<Copy className="inline-block w-4 h-4 ml-2" />
					</code>
				</span>
			);
		},
		p({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		li({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h1({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h2({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
		h3({ node, ...props }) {
			return renderWithHighlight(node, props);
		},
	};

	return markdownComponents;
}

export default getMarkdownComponents;
