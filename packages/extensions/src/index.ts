/**
 * @module Extensions package for TutoriaLLM
 * @returns Selected extensions for TutoriaLLM
 */

//MineCraft-Core
import * as MinecraftCore from "./Minecraft-Core";

//Server
import * as Server from "./Server";

const Extensions = [MinecraftCore, Server];
export default Extensions;

//types
import type { Block } from "./types/block";
import type { Locale } from "./types/locale";

export type { Block, Locale };
