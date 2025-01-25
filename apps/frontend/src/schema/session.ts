import { z } from "zod";

export const renameSessionSchema = z.object({
	name: z.string().min(3),
});

export type RenameSessionSchemaType = z.infer<typeof renameSessionSchema>;
