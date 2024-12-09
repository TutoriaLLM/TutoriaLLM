import { v4 as UUID } from "uuid";

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
