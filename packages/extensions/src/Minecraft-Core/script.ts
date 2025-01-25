import type { WSContext } from "hono/ws";
import commandMsg from "./context/commandMsg.js";
import subscribeMsg from "./context/subscribeMsg.js";

const events = [
	"AdditionalContentLoaded",
	"AgentCommand",
	"AgentCreated",
	"ApiInit",
	"AppPaused",
	"AppResumed",
	"AppSuspended",
	"AwardAchievement",
	"BlockBroken",
	"BlockPlaced",
	"BoardTextUpdated",
	"BossKilled",
	"CameraUsed",
	"CauldronUsed",
	"_ChunkChanged_1.0.2",
	"_ChunkLoaded_1.0.2",
	"_ChunkUnloaded_1.0.2",
	"ConfigurationChanged",
	"ConnectionFailed",
	"CraftingSessionCompleted",
	"EndOfDay",
	"EntitySpawned",
	"FileTransmissionCancelled",
	"FileTransmissionCompleted",
	"FileTransmissionStarted",
	"FirstTimeClientOpen",
	"FocusGained",
	"FocusLost",
	"GameSessionComplete",
	"GameSessionStart",
	"HardwareInfo",
	"HasNewContent",
	"ItemAcquired",
	"ItemCrafted",
	"ItemDestroyed",
	"ItemDropped",
	"ItemEnchanted",
	"ItemSmelted",
	"ItemUsed",
	"JoinCanceled",
	"JukeboxUsed",
	"LicenseCensus",
	"MascotCreated",
	"MenuShown",
	"MobInteracted",
	"MobKilled",
	"MultiplayerConnectionStateChanged",
	"MultiplayerRoundEnd",
	"MultiplayerRoundStart",
	"NpcPropertiesUpdated",
	"OptionsUpdated",
	"performanceMetrics",
	"PackImportStage",
	"PlayerBounced",
	"PlayerDied",
	"PlayerJoin",
	"PlayerLeave",
	"PlayerMessage",
	"PlayerTeleported",
	"PlayerTransform",
	"PlayerTravelled",
	"PortalBuilt",
	"PortalUsed",
	"PortfolioExported",
	"PotionBrewed",
	"PurchaseAttempt",
	"PurchaseResolved",
	"RegionalPopup",
	"RespondedToAcceptContent",
	"ScreenChanged",
	"ScreenHeartbeat",
	"SignInToEdu",
	"SignInToXboxLive",
	"SignOutOfXboxLive",
	"SpecialMobBuilt",
	"StartClient",
	"StartWorld",
	"TextToSpeechToggled",
	"UgcDownloadCompleted",
	"UgcDownloadStarted",
	"UploadSkin",
	"VehicleExited",
	"WorldExported",
	"WorldFilesListed",
	"WorldGenerated",
	"WorldLoaded",
	"WorldUnloaded",
];

const onConnectEvents: (() => void)[] = [];
const onMessageEvents: ((message: string) => void)[] = [];
const onDisconnectEvents: (() => void)[] = [];
let wss: WSContext = {} as WSContext;
wss.send = (message: string) => {
	console.log("extension.minecraft-core.noConnection");
};

function removeListener() {
	onConnectEvents.length = 0;
	onMessageEvents.length = 0;
	onDisconnectEvents.length = 0;
}

function reRegisterOnConnectEvents() {
	onConnectEvents.push(async () => {
		defaultOnConnectEvents();
	});
	onMessageEvents.push(async (message) => {
		defaultOnMessageEvents(message);
	});
	for (const event of onConnectEvents) {
		event();
	}
}

function getAgentPosition() {
	//エージェントの座標を取得し、グローバル変数に格納する
	if (wss) {
		wss.send(JSON.stringify(commandMsg("/agent getposition")));
		return {
			x: minecraftWorldState.agent.position.x,
			y: minecraftWorldState.agent.position.y,
			z: minecraftWorldState.agent.position.z,
		};
	}
	return {
		x: 0,
		y: 0,
		z: 0,
	};
}

//ワールドの状態のグローバルな変数/関数
const minecraftWorldState = {
	agent: {
		getPosition: getAgentPosition,
		position: {
			x: 0,
			y: 0,
			z: 0,
		},
		// detectBlock(direction: string, type: "redstone" | "block") {
		// 	//エージェントが指定した方向に指定したブロックを検知しているかどうかを問い合わせる
		// 	if (wss && type === "block") {
		// 		wss.send(JSON.stringify(commandMsg("/agent getposition")));
		// 		wss.send(JSON.stringify(commandMsg(`/agent detect ${direction}`)));
		// 	}
		// 	if (wss && type === "redstone") {
		// 		wss.send(JSON.stringify(commandMsg("/agent getposition")));

		// 		wss.send(
		// 			JSON.stringify(commandMsg(`/agent detectredstone ${direction}`)),
		// 		);
		// 	}
		// },
		detected: {
			block: {
				forward: false,
				backward: false,
				left: false,
				right: false,
				up: false,
				down: false,
			},
			redstone: {
				forward: false,
				backward: false,
				left: false,
				right: false,
				up: false,
				down: false,
			},
		},
	},
	player: {
		position: {
			x: 0,
			y: 0,
			z: 0,
		},
		isunderwater: false,
	},
};
const translatedMessage = {
	message: "extension.minecraft-core.connectInfo",
	placeholder: {
		host: serverRootPath,
		userCode: joinSessionId,
	},
};
console.info(JSON.stringify(translatedMessage));

app.get(
	"/mc",
	upgradeWebSocket((c) => ({
		onOpen: (message, ws) => {
			wss = ws;
			ws.send(JSON.stringify(commandMsg("/say Connected!")));
			console.log("generic.connected");
			for (const event of onConnectEvents) {
				event();
			}
		},
		onMessage(message, ws) {
			for (const event of onMessageEvents) {
				event(message.data.toString());
			}
		},
		onClose: () => {
			for (const event of onDisconnectEvents) {
				event();
			}
		},
	})),
);

onConnectEvents.push(async () => {
	defaultOnConnectEvents();
});
onMessageEvents.push(async (message) => {
	defaultOnMessageEvents(message);
});

function defaultOnConnectEvents() {
	if (wss) {
		//座標などのグローバル変数を取得する際に必要なリスナーを登録
		wss.send(JSON.stringify(subscribeMsg("PlayerTravelled")));
	} else {
		console.error("WebSocket is not connected.");
	}
}

function defaultOnMessageEvents(message: string) {
	const data = JSON.parse(message);
	if (data?.body && data.header.eventName === "PlayerTravelled") {
		minecraftWorldState.player = {
			position: {
				x: data.body.player.position.x,
				y: data.body.player.position.y,
				z: data.body.player.position.z,
			},
			isunderwater: data.body.isUnderwater,
		};
	}
	if (
		data?.body &&
		data.header.messagePurpose === "commandResponse" &&
		data.body.statusCode === 0
	) {
		if (data.body.position)
			minecraftWorldState.agent.position = {
				x: data.body.position.x,
				y: data.body.position.y,
				z: data.body.position.z,
			};
	}
}
