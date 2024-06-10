import * as Blockly from "blockly/core";
import { useEffect } from "react";

// カスタマイズのインポート
import { toolboxCategories } from "./toolbox";
import registerBlocks from "./blocks";
import Theme from "./theme";

// BlocklyのCSSを上書きする
import "../../styles/blockly.css";

import { useAtom } from "jotai";
import { currentSessionState, prevSessionState } from "../../state";

// ブロックを登録する
registerBlocks();

export default function Editor() {
  const [currentSession, setCurrentSession] = useAtom(currentSessionState);
  const [prevSession, setPrevSession] = useAtom(prevSessionState);

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

    // ワークスペースのブロックの変更を検知して保存
    const saveWorkspace = (event: Blockly.Events.Abstract) => {
      if (
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        // ブロックの変更イベント
        (event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.COMMENT_CHANGE ||
          event.type === Blockly.Events.COMMENT_CREATE ||
          event.type === Blockly.Events.COMMENT_DELETE ||
          event.type === Blockly.Events.COMMENT_MOVE ||
          event.type === Blockly.Events.FINISHED_LOADING)
      ) {
        const newWorkspace = Blockly.serialization.workspaces.save(workspace);
        setCurrentSession((prev) => {
          if (
            prev &&
            JSON.stringify(prev.workspace) !== JSON.stringify(newWorkspace)
          ) {
            console.log("Workspace saved: ", newWorkspace);
            setPrevSession(prev);
            return {
              ...prev,
              workspace: newWorkspace,
            };
          }
          return prev;
        });
      }
    };

    workspace.addChangeListener(saveWorkspace);

    return () => {
      workspace.dispose();
    };
  }, []);

  //currentSessionの変更を検知してワークスペースを更新
  useEffect(() => {
    const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
    if (
      currentSession &&
      prevSession &&
      JSON.stringify(currentSession.workspace) !==
        JSON.stringify(prevSession.workspace)
    ) {
      Blockly.serialization.workspaces.load(
        currentSession.workspace,
        workspace
      );
      console.log("workspace refreshed");
    }
  }, [currentSession]);

  return <div id="blocklyDiv" className="w-full h-full"></div>;
}
