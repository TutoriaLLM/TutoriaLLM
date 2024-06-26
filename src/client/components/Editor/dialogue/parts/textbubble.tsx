import { BrainCircuit, Server, User } from "lucide-react";
import { Dialogue, SessionValue } from "../../../../../type";

export default function TextBubble(props: { item: Dialogue; index: number }) {
  if (props.item.contentType === "user") {
    return (
      <div
        key={props.index}
        className="flex justify-start flex-row-reverse items-end gap-2"
      >
        <div className="text-gray-600 flex flex-col items-center">
          <span className="bg-gray-200 rounded-full p-2">
            <User />
          </span>
          <p className="text-xs">You</p>
        </div>
        <div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
          {props.item.content}
        </div>
      </div>
    );
  }
  if (props.item.contentType === "ai") {
    return (
      <div key={props.index} className="flex justify-start items-end gap-2">
        <div className="text-gray-600 flex flex-col items-center">
          <span className="bg-gray-200 rounded-full p-2">
            <BrainCircuit />
          </span>
          <p className="text-xs">AI</p>
        </div>
        <div className="rounded-2xl rounded-bl-none bg-sky-600 text-white p-3 shadow max-w-xs">
          {props.item.content}
        </div>
      </div>
    );
  }
  if (props.item.contentType === "log") {
    return (
      <div key={props.index} className="flex justify-start items-end gap-2">
        <div className="text-gray-600 flex flex-col items-center">
          <span className="bg-gray-200 rounded-full p-2">
            <Server />
          </span>
          <p className="text-xs">Server</p>
        </div>
        <div className="rounded-2xl rounded-bl-none bg-sky-600 text-white p-3 shadow max-w-xs">
          {props.item.content}
        </div>
      </div>
    );
  }
  return null; // エラー回避のためにデフォルトでnullを返す
}
