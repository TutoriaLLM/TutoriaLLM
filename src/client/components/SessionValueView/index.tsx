import type { SessionValue } from "../../../type.js";
import { langToStr } from "../../../utils/langToStr.js";
import LLMContext from "./llmContext.js";
import Stats from "./stats.js";
import Time from "./time.js";
import SelectedTutorial from "./tutorial.js";
import WorkspacePreview from "./workspacePreview.js";

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
			<WorkspacePreview session={session} />
			<LLMContext session={session} />
			<Stats session={session} />
			<Time session={session} />
			<SelectedTutorial session={session} />
		</div>
	);
}
