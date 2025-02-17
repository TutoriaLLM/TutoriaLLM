import { currentTabState } from "@/state";
import type { StepType } from "@reactour/tour";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
export function tourSteps(isMobile: boolean) {
	const setActiveTab = useSetAtom(currentTabState);
	const { t } = useTranslation();
	return [
		{
			selector: ".app",
			content: () => t("tour.welcome"),
		},
		// For mobile, move to workspace
		...(isMobile
			? [
					{
						selector: ".tabs",
						content: () => t("tour.tabs"),
						mutationObservables: [".tabs"],
					},
					{
						selector: ".workspaceTab",
						content: () => t("tour.switchToWorkspace"),
						mutationObservables: [".workspaceTab"],
						action: () => setActiveTab("workspaceTab"),
					},
				]
			: []),
		{
			selector: ".blocklyWorkspace",
			content: () => t("tour.blocklyWorkspace"),
			mutationObservables: [".blocklyWorkspace"],
		},
		{
			selector: ".execSwitch",
			content: () => t("tour.execSwitch"),
		},
		{
			selector: ".sync",
			content: () => t("tour.syncCode"),
		},
		// For mobile, go to Dialog
		...(isMobile
			? [
					{
						selector: ".dialogueTab",
						content: () => t("tour.switchToDialogue"),
						mutationObservables: [".dialogueTab"],
						action: () => setActiveTab("dialogueTab"),
					},
				]
			: []),

		{
			selector: ".dialogue",
			content: () => t("tour.dialogue"),
		},
		{
			selector: ".switchMode",
			content: () => t("tour.switchMode"),
		},
	] as StepType[];
}
