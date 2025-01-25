import { getSpecificTutorial } from "@/api/admin/tutorials";
import type { SessionValue, Tutorial } from "@/type";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

//for admin
export default function SelectedTutorial(props: { session: SessionValue }) {
	const { session } = props;
	const { t } = useTranslation();
	const tutorialId = session.tutorial.tutorialId;
	const [tutorial, setTutorial] = useState<null | Tutorial>(null);
	useEffect(() => {
		if (tutorialId) {
			getSpecificTutorial({ id: tutorialId.toString() }).then((response) => {
				setTutorial(response);
			});
		}
	}, [tutorialId]);
	return (
		<div className="bg-card rounded-2xl p-2 gap-2 w-full font-medium">
			<h2 className="text-lg font-semibold">{t("admin.selectedTutorial")}</h2>
			<div className="text-sm">
				{t("admin.tutorialId")}{" "}
				{tutorial?.id ? tutorial.id : t("admin.notSelected")}
			</div>
			<div className="text-sm">
				{t("admin.tutorialTitle")}
				{tutorial?.metadata.title
					? tutorial.metadata.title
					: t("admin.notSelected")}
			</div>
		</div>
	);
}
