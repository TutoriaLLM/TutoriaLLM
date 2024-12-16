import { uuidv7 as UUID } from "uuidv7";

export default function subscribeMsg(eventName: string) {
	console.log(`Subscribed${eventName}`);
	return {
		header: {
			requestId: UUID(),
			messagePurpose: "subscribe",
			version: 17039360,
			messageType: "commandRequest",
		},
		body: {
			eventName: eventName,
		},
	};
}
