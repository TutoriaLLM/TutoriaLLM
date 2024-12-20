import * as functions from "./functions";
import * as lists from "./lists";
import * as logic from "./logic";
// Blockly Blocks - Basics
//配列でエクスポートする
import * as loop from "./loop";
import * as math from "./math";
import * as text from "./text";
import * as variables from "./variables";

const basicBlocks = [loop, logic, variables, math, text, functions, lists];
export default basicBlocks;
