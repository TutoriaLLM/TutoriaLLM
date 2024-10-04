import { z } from "zod";

export const zodSchema = z.object({
	isQuestion: z
		.boolean()
		.describe(
			"true if the user asked a question, false if it is a statement or just comment of user",
		),
	response: z
		.string()
		.describe(
			"response for user. Do not include blockId, blockName, and any unreadable characters in this field.",
		),
	blockId: z
		.string()
		.optional()
		.describe(
			"block id from user's Blockly workspace if needed. Skip this response if not needed.",
		),
	// blockName: z
	// 	.string()
	// 	.optional()
	// 	.describe(
	// 		"block name to being used for code. It is defined from Blockly Workspace, and can refer from tutorial. Skip this response if not needed.",
	// 	),
	progress: z.number().describe("progress of the tutorial shown by 10 to 100."),
	ui: z
		.enum(["selectTutorial", ""])
		.optional()
		.describe(
			"Provide UI elements for the user to take action. If the user does not think such an action is necessary, skip this response.",
		),
	quickReplies: z.array(z.string()).describe("quick replies for the user."),
});
