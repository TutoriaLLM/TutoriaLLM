import type { StepType } from "@reactour/tour";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { currentTabState } from "../state.js";
export function tourSteps(isMobile: boolean) {
	const setActiveTab = useSetAtom(currentTabState);
	const { t } = useTranslation();
	return [
		{
			selector: ".app",
			content: () => t("tour.welcome"),
		},
		{
			selector: ".joinCode",
			content: () => t("tour.joinCode"),
		},
		//mobileの場合はワークスペースに移動する
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
		//mobileの場合はDialogに移動する
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
