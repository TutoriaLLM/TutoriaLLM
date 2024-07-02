import type { ContentType, Dialogue, SessionValue } from "../type.js";

export function updateDialogue(
	message: string,
	currentDataJson: SessionValue,
	contentType: ContentType,
): SessionValue {
	console.log("updateDialogue");
	return {
		...currentDataJson,
		dialogue: [
			...currentDataJson.dialogue,
			{
				id: currentDataJson.dialogue.length + 1,
				contentType: contentType,
				isuser: false,
				content: message,
			} as Dialogue,
		],
	};
}
