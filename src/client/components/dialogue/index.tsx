import { Send, Server } from "lucide-react";
import type { Dialogue, SessionValue } from "../../../server/type";

import { currentSessionState } from "../../state";
import { useAtom } from "jotai";

export default function Dialogue() {
  const [sesionState, setSessionState] = useAtom(currentSessionState);
  function sendMessage(message: string) {}

  return (
    <div className="w-full h-full flex flex-col justify-end p-4 bg-gray-100">
      <div className="w-full h-full overflow-scroll flex flex-col gap-4 mb-4">
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-none bg-blue-600 text-white p-3 shadow max-w-xs">
            Hoo!(test)
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
            baa!(test)
          </div>
        </div>
        {sesionState?.dialogue.map(
          (
            item: { contentType: string; isuser: boolean; content: any },
            index: number
          ) => {
            if (item.contentType === "user") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none bg-blue-600 text-white p-3 shadow max-w-xs">
                    {item.content}
                  </div>
                </div>
              );
            }
            if (item.contentType === "ai") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
                    {item.content}
                  </div>
                </div>
              );
            }
            if (item.contentType === "log") {
              return (
                <div key={index} className="flex justify-start items-end gap-2">
                  <div className="text-gray-600 flex flex-col items-center">
                    <span className="bg-gray-200 rounded-full p-2">
                      <Server />
                    </span>
                    <p className="text-xs">Server</p>
                  </div>
                  <div className="rounded-2xl rounded-bl-none bg-sky-600 text-white p-3 shadow max-w-xs">
                    {item.content}
                  </div>
                </div>
              );
            }
            return null; // エラー回避のためにデフォルトでnullを返す
          }
        )}
      </div>
      <div className="w-full flex items-center bg-white p-2 shadow rounded-2xl">
        <input
          type="text"
          placeholder="Ask anything..."
          className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-2 p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex">
          <Send />
        </button>
      </div>
    </div>
  );
}
