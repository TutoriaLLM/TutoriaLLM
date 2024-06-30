import { useAtom } from "jotai";
//選択すると、stateのtutorial内容を変更する。
import { currentSessionState } from "../../../state";

//dbから利用可能なチュートリアルを表示する(api経由)

// 1. ピン留めされたチュートリアルを表示（adminで設定）

// 2. AIにえらんでもらう（タグで絞り込み）

export default function TutorialPicker() {
	return (
		<div className="w-full gap-2 rounded-2xl bg-gray-200 text-gray-800 p-3 max-w-md">
			<p className="text-sm text-gray-600">Let's start!</p>
			<h3 className="font-semibold text-lg">Pick your tutorial</h3>
		</div>
	);
}
