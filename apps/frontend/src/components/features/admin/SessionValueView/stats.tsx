import type { SessionValue } from "@/type";
import { msToTime } from "@/utils/time";
import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Stats(props: { session: SessionValue }) {
	const { session } = props;
	const { t } = useTranslation();
	return (
		<div className="bg-card font-medium text-base text-card-foreground rounded-2xl p-2 gap-2 w-full">
			<h2 className="text-lg font-semibold">{t("admin.stats")}</h2>
			<h3 className="font-medium text-md  flex gap-1">
				<Bot />
				{t("admin.totalInvokedLLM")}
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalInvokedLLM : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<Puzzle />
				{t("admin.currentNumOfBlocks")}
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.currentNumOfBlocks : 0}
				</p>
			</h3>
			<h3 className=" flex gap-1 flex-nowrap">
				<Clock />
				{t("admin.totalConnectingTime")}
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? msToTime(session.stats.totalConnectingTime) : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<MessageCircleMore />
				{t("admin.totalUserMessages")}
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalUserMessages : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<Play />
				{t("admin.totalCodeExecutions")}
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalCodeExecutions : 0}
				</p>
			</h3>{" "}
		</div>
	);
}
