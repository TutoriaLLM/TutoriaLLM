import { randomUUID } from "crypto";

export default function (eventName: any) {
  console.log("Subscribed" + eventName);
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
