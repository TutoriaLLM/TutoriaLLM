import * as Blockly from "blockly/core";
import { useEffect } from "react";

// カスタマイズのインポート
import { toolboxCategories } from "./toolbox";
import registerBlocks from "./blocks";
import Theme from "./theme";

// BlocklyのCSSを上書きする
import "../../styles/blockly.css";

import { currentSessionState } from "../../pages/editorPage";
import { useAtom } from "jotai";

// ブロックを登録する
registerBlocks();

export default function Editor() {
  const [currentSession, setCurrentSession] = useAtom(currentSessionState);

  useEffect(() => {
    async function getWorkspace() {
      const workspaceArea = document.getElementById("workspaceArea");
      console.log("workspaceArea", workspaceArea);

      if (workspaceArea) {
        const resizeObserver = new ResizeObserver((entries) => {
          onResize();
        });
        resizeObserver.observe(workspaceArea);
      }

      function onResize() {
        console.log("Resized");
        const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
        Blockly.svgResize(workspace);
      }
    }
    getWorkspace();

    // Blocklyのワークスペースを初期化
    const workspace = Blockly.inject("blocklyDiv", {
      toolbox: toolboxCategories,
      theme: Theme,
      renderer: "zelos",
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
      },
    });

    // セッションが存在する場合はワークスペースを読み込む
    if (currentSession && currentSession.workspace) {
      Blockly.serialization.workspaces.load(
        currentSession.workspace,
        workspace
      );
    }

    // ワークスペースの変更を検知して保存
    const saveWorkspace = () => {
      const newWorkspace = Blockly.serialization.workspaces.save(workspace);
      setCurrentSession((prev) => {
        if (prev) {
          console.log("Workspace saved: ", newWorkspace);
          return {
            ...prev,
            workspace: newWorkspace,
          };
        }
        return prev;
      });
    };

    workspace.addChangeListener(saveWorkspace);

    return () => {
      workspace.dispose();
    };
  }, []);

  return <div id="blocklyDiv" className="w-full h-full"></div>;
}
