import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";
import { msToTime } from "../../../utils/time";
import type { SessionValue } from "../../../type";

export default function LLMContext(props: { session: SessionValue }) {
	const { session } = props;
	return (
		<div className="bg-gray-100 rounded-2xl p-2 gap-2 w-full">
			<h2 className="text-lg font-semibold">Summary for this session</h2>
			<p className="font-medium text-md text-gray-600 flex gap-1">
				{!session === (null || undefined)
					? session.llmContext
					: "No context available"}
			</p>
		</div>
	);
}
