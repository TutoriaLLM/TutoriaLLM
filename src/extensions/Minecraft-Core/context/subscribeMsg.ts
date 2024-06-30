import { randomUUID } from "node:crypto";

export default function subscribeMsg(eventName: string) {
	console.log(`Subscribed${eventName}`);
	return {
		header: {
			requestId: randomUUID(),
			messagePurpose: "subscribe",
			version: 1,
			messageType: "commandRequest",
		},
		body: {
			eventName: eventName,
		},
	};
}
