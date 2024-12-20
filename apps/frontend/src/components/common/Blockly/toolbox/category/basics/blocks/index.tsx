import * as functions from "@/components/common/Blockly/toolbox/category/basics/blocks/functions";
import * as lists from "@/components/common/Blockly/toolbox/category/basics/blocks/lists";
import * as logic from "@/components/common/Blockly/toolbox/category/basics/blocks/logic";
// Blockly Blocks - Basics
//配列でエクスポートする
import * as loop from "@/components/common/Blockly/toolbox/category/basics/blocks/loop";
import * as math from "@/components/common/Blockly/toolbox/category/basics/blocks/math";
import * as text from "@/components/common/Blockly/toolbox/category/basics/blocks/text";
import * as variables from "@/components/common/Blockly/toolbox/category/basics/blocks/variables";

const basicBlocks = [loop, logic, variables, math, text, functions, lists];
export default basicBlocks;
