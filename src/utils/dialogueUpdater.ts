import { ContentType, Dialogue, SessionValue } from "../type.js";

export function updateDialogue(
  message: string,
  currentDataJson: SessionValue,
  contentType: ContentType
): SessionValue {
  return {
    ...currentDataJson,
    dialogue: [
      ...currentDataJson.dialogue,
      {
        contentType: contentType,
        isuser: false,
        content: message,
      },
    ],
  };
}

export function extractDialogue(currentDataJson: SessionValue): Dialogue[] {
  return currentDataJson.dialogue.map((entry) => entry.content);
}
