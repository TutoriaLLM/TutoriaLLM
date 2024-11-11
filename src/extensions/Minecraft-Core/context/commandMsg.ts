import { randomUUID } from "node:crypto";

export default function commandMsg(command: string) {
	return {
		header: {
			requestId: randomUUID(),
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
