import { z } from "@hono/zod-openapi";
import { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import { stringToNumber } from "@/utils/zStringtoNumber";
const contentTypeEnum = [
	"user",
	"user_audio",
	"ai",
	"ai_audio",
	"log",
	"error",
	"info",
	"group_log",
	"ui", // AIによって動的に生成されるUI要素
	"request",
] as const;

export type ContentType = (typeof contentTypeEnum)[number];

const responseModeEnum = ["text", "audio"] as const;
// timestamp用のスキーマ
export const timestampSchema = z.object({
	createdAt: z.date(), // ISO文字列として扱う
	updatedAt: z.date(), // ISO文字列として扱う
});

export type DialogueType = {
	id: number;
	contentType: ContentType;
	isuser: boolean;
	content: string | DialogueType[];
	ui?: string;
};

export const DialogueSchema: z.ZodSchema<DialogueType> = z.lazy(() =>
	z.object({
		id: z.number(),
		contentType: z.enum(contentTypeEnum),
		isuser: z.boolean(),
		content: z.union([z.string(), z.array(DialogueSchema)]),
		ui: z.string().optional(),
	}),
);

export const DialogueOpenApiSchema = DialogueSchema.openapi({
	//lazyの場合は手動で定義する必要がある: https://github.com/honojs/middleware/issues/643
	type: "object",
	title: "Dialogue",
	description: "A dialogue type schema",
	example: {
		id: 1,
		contentType: "user",
		isuser: true,
		content: "Hello",
		ui: "example_ui",
	},
});
export type Dialogue = z.infer<typeof DialogueOpenApiSchema>;

export const ClickSchema = z.object({
	x: z.number(),
	y: z.number(),
	value: z.number(),
	timestamp: z.number(),
});
export type Click = z.infer<typeof ClickSchema>;

export const TutorialSchema = z.object({
	isTutorial: z.boolean(),
	tutorialId: z.number().nullable(),
	progress: z.number(),
});
export type TutorialStats = z.infer<typeof TutorialSchema>;

export const TutorialMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	selectCount: z.number(),
	author: z.string().optional(),
});
export type TutorialMetadata = z.infer<typeof TutorialMetadataSchema>;

export const TrainingMetadataSchema = z.object({
	author: z.string().optional(),
	date: z.string().optional(),
	sessionCode: z.string().optional(),
});
export type TrainingMetadata = z.infer<typeof TrainingMetadataSchema>;

export const StatsSchema = z.object({
	totalConnectingTime: z.number(),
	currentNumOfBlocks: z.number(),
	totalInvokedLLM: z.number(),
	totalUserMessages: z.number(),
	totalCodeExecutions: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const AudioSchema = z.object({
	id: z.string(),
	base64: z.string(),
});
export type SavedAudio = z.infer<typeof AudioSchema>;

export const sessionValueSchema = z
	.object({
		// 基本情報
		sessioncode: z.string(),
		uuid: z.string(),

		// 対話関連
		dialogue: z.array(DialogueOpenApiSchema).nullable(),

		// UI関連
		quickReplies: z.array(z.string()).nullable(),
		isReplying: z.boolean(),
		workspace: z.record(z.string()).nullable(),
		isVMRunning: z.boolean(),
		clients: z.array(z.string()).nullable(),

		// 設定関連
		language: z.string().nullable(),
		easyMode: z.boolean().nullable(),
		responseMode: z.enum(responseModeEnum),
		llmContext: z.string().nullable(),

		// 統計・進捗関連
		tutorial: TutorialSchema,
		stats: StatsSchema,

		// メディア関連
		audios: z.array(AudioSchema).nullable(),
		userAudio: z.string().nullable(),
		screenshot: z.string().nullable(),

		// インタラクション関連
		clicks: z.array(ClickSchema).nullable(),
	})
	.merge(timestampSchema);

export const SessionValueListSchema = z.array(sessionValueSchema);

export const SessionValueListSchemaWithSort = z.object({
	sessions: SessionValueListSchema,
	total: z.number(),
	page: z.number().optional(),
	limit: z.number().optional(),
});

export type SessionValue = z.infer<typeof sessionValueSchema>;
export type SessionValueList = z.infer<typeof SessionValueListSchema>;

export const sessionCodeSchema = z.object({
	sessionCode: z.string().openapi({
		param: {
			name: "sessionCode",
			in: "path",
		},
	}),
});

export const SessionQuerySchema = z.object({
	page: stringToNumber.optional(),
	limit: stringToNumber.optional(),
	//sessionvalueのkey
	sortField: z.enum(
		Object.keys(sessionValueSchema.shape) as [
			keyof typeof sessionValueSchema.shape,
		],
	),
	sortOrder: z.string().optional(),
});

export const deleteSessionParam = {
	schema: sessionCodeSchema.openapi("DeleteSessionParam"),
	vErr: () =>
		createValidationErrorResponseSchema(deleteSessionParam.schema).openapi(
			"DeleteSessionParamValidationErrorResponse",
		),
};

export const listSessionsQuery = {
	schema: SessionQuerySchema.openapi("ListSessionsQuery"),
	vErr: () =>
		createValidationErrorResponseSchema(SessionQuerySchema).openapi(
			"ListSessionsQueryValidationErrorResponse",
		),
};