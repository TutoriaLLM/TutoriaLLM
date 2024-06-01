import Navbar from "../components/Navbar";
import Editor from "../components/Editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function EditorPage() {
  var devicewidth = window.innerWidth;
  const isMobile = devicewidth < 768;
  const direction = isMobile ? "vertical" : "horizontal";

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900 text-stone-200">
      <Navbar />
      <PanelGroup autoSaveId="workspace" direction={direction}>
        <Panel
          id="workspaceArea"
          defaultSize={75}
          order={1}
          maxSize={80}
          minSize={20}
        >
          <Editor />
        </Panel>
        <PanelResizeHandle className="md:h-full md:w-3 h-3 w-full transition bg-gray-400 hover:bg-gray-500 active:bg-yellow-300 flex md:flex-col justify-center items-center gap-1">
          <span className="rounded-full p-1 bg-gray-50"></span>
          <span className="rounded-full p-1  bg-gray-50"></span>
          <span className="rounded-full p-1  bg-gray-50"></span>
        </PanelResizeHandle>
        <Panel
          id="dialogueArea"
          defaultSize={25}
          order={2}
          maxSize={80}
          minSize={20}
        >
          dialogue
        </Panel>
      </PanelGroup>
    </div>
  );
}
