import * as Switch from "@radix-ui/react-switch";

import { isWorkspaceConnected } from "../state";
import { useAtomValue } from "jotai";

//このスイッチでコードを実行するかどうかを切り替える。親コンポーネントに依存せずに動作するようにする。
export function ExecSwitch() {
  const isConnected = useAtomValue(isWorkspaceConnected);
  //チェックの有無は、確実に状態を表示するため、コンポーネント側で状態を用意せず、サーバーの状態を元に表示する。
  return (
    <form className="justify-center items-center">
      {isConnected ? (
        <div className="flex items-center p-2 gap-2 rounded-2xl border border-gray-300">
          <label className="text-gray-800 text-base leading-none font-semibold">
            Run Code
          </label>
          <Switch.Root
            onCheckedChange={() => console.log("check changed")}
            className="w-16 h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100"
          >
            <Switch.Thumb className="block w-8 h-8 bg-white rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500" />
          </Switch.Root>
        </div>
      ) : null}
    </form>
  );
}

export default ExecSwitch;
