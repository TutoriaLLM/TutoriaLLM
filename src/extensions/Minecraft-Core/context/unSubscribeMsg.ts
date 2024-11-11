import { randomUUID } from "node:crypto";

export default function unsubscribeMsg(eventName: string) {
	console.log(`Unsubscribed${eventName}`);
	return {
		header: {
			requestId: randomUUID(),
			messagePurpose: "unsubscribe",
			version: 17039360,
			messageType: "commandRequest",
		},
		body: {
			eventName: eventName,
		},
	};
}
