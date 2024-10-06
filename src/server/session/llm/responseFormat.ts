import { z } from "zod";

export const zodSchema = z.object({
	isQuestion: z
		.boolean()
		.describe(
			"true if the user asked a question, false if it is a statement or just comment of user",
		),
	formattedUserQuestion: z
		.string()
		.optional()
		.describe(
			"Formatted user question for training data, in user's language. Contain background information of the question, such as what user doing. only if isQuestion is true.",
		),
	response: z.string().describe("response for user."),
	progress: z.number().describe("progress of the tutorial shown by 10 to 100."),
	ui: z
		.enum(["selectTutorial", ""])
		.optional()
		.describe(
			"Provide UI elements for the user to take action. If the user does not think such an action is necessary, skip this response.",
		),
	quickReplies: z.array(z.string()).describe("quick replies for the user."),
});
