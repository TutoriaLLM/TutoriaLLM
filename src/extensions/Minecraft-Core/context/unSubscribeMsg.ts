import { randomUUID } from "node:crypto";

export default function unsubscribeMsg(eventName: string) {
  console.info(`Unsubscribed${eventName}`);
  return {
    header: {
      requestId: randomUUID(),
      messagePurpose: "unsubscribe",
      version: 1,
      messageType: "commandRequest",
    },
    body: {
      eventName: eventName,
    },
  };
}
