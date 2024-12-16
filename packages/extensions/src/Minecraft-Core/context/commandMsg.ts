import { uuidv7 as UUID } from "uuidv7";

export default function commandMsg(command: string) {
	return {
		header: {
			requestId: UUID(),
			messagePurpose: "commandRequest",
			version: 17039360,
			messageType: "commandRequest",
		},
		body: {
			version: 17039360,
			origin: {
				type: "player",
			},
			overworld: "default",
			commandLine: command,
		},
	};
}
