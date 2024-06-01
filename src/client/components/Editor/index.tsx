import * as Blockly from "blockly/core";
import { useEffect, useState } from "react";

//import customizations
import { toolboxCategories } from "./toolbox";
import registerBlocks from "./blocks";
import Theme from "./theme";
//blocklyのcssを上書きする
import "../../styles/blockly.css";

registerBlocks();

export default function Editor() {
  const [xml, setXml] = useState("");

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

    // Passes the injection div.
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

    return () => {
      // Clean up the workspace when the component unmounts
      workspace.dispose();
    };
  }, []);

  return <div id="blocklyDiv" className="w-full h-full"></div>;
}
