let wss;
let onMessageEvent;
let onConnectEvent;
let onDisconnectEvent;

console.log(`Connect your Minecraft at: api/vm/${code}`);

// vmExpressはコンテキストとして利用可能
vmExpress.ws(`/${code}`, async (ws, req) => {
	console.log(
		"Connection established. Sending subscribe message for Minecraft events: PlayerMessage.",
	);
	ws.send(JSON.stringify(subscribeMsg("PlayerMessage")));
	ws.send(JSON.stringify(commandMsg("/say Hello, Minecraft!")));

	wss = ws;

	ws.on("open", () => {
		if (onConnectEvent) {
			onConnectEvent();
		}
	});

	ws.on("message", async (message) => {
		if (onMessageEvent) {
			await onMessageEvent(message);
		}
	});

	ws.on("close", () => {
		if (onDisconnectEvent) {
			onDisconnectEvent();
		}
	});
});
