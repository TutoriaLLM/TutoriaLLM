import { z } from "zod";

export const AppConfigSchema = z.object({
	General_Settings: z.object({
		Enable_Join_by_code: z.boolean(),
		Enable_Create_Room: z.boolean(),
		Enable_Memory_Use_Log: z.boolean(),
	}),
	AI_Settings: z.object({
		Chat_AI_Model: z.string(),
		Chat_Audio: z.boolean(),
		Chat_AI_Temperature: z.number(),
	}),
	Client_Settings: z.object({
		AutoReply: z.boolean(),
		Reply_Time_ms: z.number(),
		Screenshot_Interval_min: z.number(),
		GA_Tracking_ID: z.string(),
	}),
	Code_Execution_Limits: z.object({
		Max_CodeRangeSizeMb: z.number(),
		Max_OldGenerationSizeMb: z.number(),
		Max_YoungGenerationSizeMb: z.number(),
		Max_Num_Message_Queue: z.number(),
	}),
	Client_Sentry_Settings: z.object({
		Sentry_DSN: z.string(),
		replaysOnErrorSampleRate: z.number(),
		replaysSessionSampleRate: z.number(),
		tracesSampleRate: z.number(),
	}),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;
