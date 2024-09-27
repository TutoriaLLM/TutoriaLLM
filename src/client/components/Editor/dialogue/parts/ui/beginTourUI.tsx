import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useTour } from "@reactour/tour";

function BeginTourUI() {
	const { t } = useTranslation();
	const { setIsOpen } = useTour(); // ツアーの開始/終了を管理するフック

	return (
		<div className="gap-2 bg-gray-100 p-2 rounded-2xl">
			<span>
				<h3 className="font-semibold text-lg">{t("tutorial.tour")}</h3>
				<p className="text-sm text-gray-600">{t("tutorial.startTour")}</p>
			</span>
			<button
				type="button"
				onClick={() => setIsOpen(true)} // ツアーを開始する
				className="bg-sky-500 group text-white flex justify-center items-center text-sm max-w-sm rounded-2xl p-2 mt-2 hover:text-gray-200 gap-2 transition-all startTour"
			>
				<p>{t("tutorial.startTourButton")}</p>
				<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 transition" />
			</button>
		</div>
	);
}

export { BeginTourUI };
