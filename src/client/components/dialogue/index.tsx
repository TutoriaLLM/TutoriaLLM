import { Send } from "lucide-react";

export default function Dialogue() {
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
