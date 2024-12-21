import { uuidv7 as UUID } from "uuidv7";

export default function unsubscribeMsg(eventName: string) {
	console.log(`Unsubscribed${eventName}`);
	return {
		header: {
			requestId: UUID(),
			messagePurpose: "unsubscribe",
			version: 17039360,
			messageType: "commandRequest",
		},
		body: {
			eventName: eventName,
		},
	};
}
