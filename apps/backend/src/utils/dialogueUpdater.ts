import type {
	ContentType,
	Dialogue,
	SessionValue,
} from "@/modules/session/schema";

export function updateDialogue(
	message: string,
	currentDataJson: SessionValue,
	contentType: ContentType,
): SessionValue {
	return {
		...currentDataJson,
		dialogue: [
			...(currentDataJson.dialogue ?? []),
			{
				id: (currentDataJson.dialogue?.length ?? 0) + 1,
				contentType: contentType,
				isUser: false,
				content: message,
			} as Dialogue,
		],
	};
}
