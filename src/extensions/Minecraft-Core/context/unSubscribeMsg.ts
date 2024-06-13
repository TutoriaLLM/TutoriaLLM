import { randomUUID } from "crypto";

export default function (eventName: any) {
  console.log("Unsubscribed" + eventName);
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
