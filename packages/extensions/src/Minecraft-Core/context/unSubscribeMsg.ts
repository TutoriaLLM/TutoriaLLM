import { v4 as UUID } from "uuid";

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
