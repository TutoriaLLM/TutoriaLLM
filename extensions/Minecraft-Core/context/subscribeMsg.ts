import { randomUUID } from "node:crypto";

export default function subscribeMsg(eventName: string) {
	console.log(`Subscribed${eventName}`);
	return {
		header: {
			requestId: randomUUID(),
			messagePurpose: "subscribe",
			version: 17039360,
			messageType: "commandRequest",
		},
		body: {
			eventName: eventName,
		},
	};
}
