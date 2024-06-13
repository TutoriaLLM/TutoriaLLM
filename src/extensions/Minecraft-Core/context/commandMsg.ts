import { randomUUID } from "crypto";

export default function (command: any) {
  return {
    header: {
      requestId: randomUUID(),
      messagePurpose: "commandRequest",
      version: 1,
      messageType: "commandRequest",
    },
    body: {
      version: 1,
      origin: {
        type: "player",
      },
      overworld: "default",
      commandLine: command,
    },
  };
}
