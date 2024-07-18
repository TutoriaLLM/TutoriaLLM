import type { SessionValue } from "../../../type";
import LLMContext from "./llmContext";
import Stats from "./stats";

export function SessionValueView(props: { session: SessionValue }) {
	const { session } = props;
	return (
		<div className="w-full flex flex-col gap-3">
			<h1 className="text-2xl font-bold">Analytics of this session</h1>
			<p className="text-gray-600 text-base">code: {session?.sessioncode}</p>
			<LLMContext session={session} />
			<Stats session={session} />
		</div>
	);
}
