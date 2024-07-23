import type { SessionValue } from "../../../type";
import { langToStr } from "../../../utils/langToStr";
import LLMContext from "./llmContext";
import Stats from "./stats";
import Time from "./time";
import SelectedTutorial from "./tutorial";

export function SessionValueView(props: { session: SessionValue }) {
	const { session } = props;
	console.log(session);
	return (
		<div className="w-full flex flex-col gap-3">
			<h1 className="text-2xl font-bold">Analytics of this session</h1>
			<p className="text-gray-600 text-base">code: {session?.sessioncode}</p>
			<p className="text-gray-600 text-base">
				language: {langToStr(session?.language)}
			</p>

			<LLMContext session={session} />
			<Stats session={session} />
			<Time session={session} />
			<SelectedTutorial session={session} />
		</div>
	);
}
