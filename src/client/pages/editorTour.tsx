import { useTranslation } from "react-i18next";
import { useTour, type StepType } from "@reactour/tour";
export function tourSteps() {
	console.log("tourSteps");
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
		{
			selector: ".blocklyWorkspace",
			content: () => t("tour.blocklyWorkspace"),
			mutationObservables: [".blocklyWorkspace"],
		},
		{
			selector: ".dialogue",
			content: () => t("tour.dialogue"),
		},
		{
			selector: ".tutorialSelector",
			content: () => t("tour.tutorialSelector"),
		},
		{
			selector: ".execSwitch",
			content: () => t("tour.execSwitch"),
		},
		{
			selector: ".push",
			content: () => t("tour.pushCode"),
		},
		{
			selector: ".startTour",
			content: () => t("tour.tourAgain"),
		},
	] as StepType[];
}
