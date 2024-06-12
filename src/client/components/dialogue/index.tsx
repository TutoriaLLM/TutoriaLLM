import { PlusCircle, Send, Server, User } from "lucide-react";
import type { Dialogue, SessionValue } from "../../../type";

import { currentSessionState } from "../../state";
import { useAtom } from "jotai";
import { useState } from "react";

export default function Dialogue() {
  const [sesionState, setSessionState] = useAtom(currentSessionState);
  const [message, setMessage] = useState("");
  function sendMessage(message: string) {
    // メッセージを配列に追加する
    setSessionState((prev) => {
      if (prev) {
        return {
          ...prev,
          dialogue: [
            ...prev.dialogue,
            { contentType: "user", isuser: true, content: message },
          ],
        };
      }
      return prev;
    });
  }

  return (
    <div className="w-full h-full flex flex-col justify-end bg-gray-100 font-medium">
      <div className="w-full h-full overflow-scroll flex flex-col gap-4 p-4 py-8">
        {sesionState?.dialogue.map(
          (
            item: { contentType: string; isuser: boolean; content: any },
            index: number
          ) => {
            if (item.contentType === "user") {
              return (
                <div
                  key={index}
                  className="flex justify-start flex-row-reverse items-end gap-2"
                >
                  <div className="text-gray-600 flex flex-col items-center">
                    <span className="bg-gray-200 rounded-full p-2">
                      <User />
                    </span>
                    <p className="text-xs">You</p>
                  </div>
                  <div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
                    {item.content}
                  </div>
                </div>
              );
            }
            if (item.contentType === "ai") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="rounded-2xl rounded-br-none bg-blue-500 text-gray-800 p-3 shadow max-w-xs">
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
      <div className="w-full p-2">
        <div className="flex items-center bg-white shadow gap-2 p-2 rounded-2xl">
          <button className=" p-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 flex">
            <PlusCircle />
          </button>
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 px-4 py-2 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className=" p-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 flex"
            onClick={() => sendMessage(message)}
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
}
