import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";
import { msToTime } from "../../../utils/time.js";
import type { SessionValue } from "../../../type.js";

export default function LLMContext(props: { session: SessionValue }) {
	const { session } = props;
	return (
		<div className="bg-gray-100 rounded-2xl p-2 gap-2 w-full">
			<h2 className="text-lg font-semibold">Summary for this session</h2>
			{
				//base64画像を表示
				session.screenshot ? (
					<img
						src={session.screenshot}
						alt="Screenshot"
						className="w-full h-full max-h-80 object-contain rounded-lg"
					/>
				) : (
					<div className="w-full h-[200px] bg-gray-200 rounded-lg flex items-center justify-center">
						No screenshot available
					</div>
				)
			}
			<p className="font-medium text-md text-gray-600 flex gap-1">
				{!session === (null || undefined)
					? session.llmContext
					: "No context available"}
			</p>
		</div>
	);
}
