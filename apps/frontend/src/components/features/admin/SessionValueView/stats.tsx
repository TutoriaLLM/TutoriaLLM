import type { SessionValue } from "@/type";
import { msToTime } from "@/utils/time";
import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";

export default function Stats(props: { session: SessionValue }) {
	const { session } = props;
	return (
		<div className="bg-card font-medium text-base text-card-foreground rounded-2xl p-2 gap-2 w-full">
			<h2 className="text-lg font-semibold">Stats</h2>
			<h3 className="font-medium text-md  flex gap-1">
				<Bot />
				Total Invoked LLM:
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalInvokedLLM : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<Puzzle />
				Current Number of Blocks:
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.currentNumOfBlocks : 0}
				</p>
			</h3>
			<h3 className=" flex gap-1 flex-nowrap">
				<Clock />
				Total Connecting Time:
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? msToTime(session.stats.totalConnectingTime) : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<MessageCircleMore />
				Total User Messages:
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalUserMessages : 0}
				</p>
			</h3>
			<h3 className="  flex gap-1">
				<Play />
				Total Code Executions:
				<p className="text-lg font-semibold font-mono">
					{session?.stats ? session.stats.totalCodeExecutions : 0}
				</p>
			</h3>{" "}
		</div>
	);
}
