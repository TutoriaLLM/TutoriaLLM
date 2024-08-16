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

const onConnectEvents = [] as (() => void)[];
const onMessageEvents = [] as ((message: string) => void)[];
const onDisconnectEvents = [] as (() => void)[];
let wss: WSContext;

//ワールドの状態のグローバルな変数
const minecraftWorldState = {
	player: {
		position: {
			x: 0,
			y: 0,
			z: 0,
		},
		isunderwater: false,
	},
};

console.info(
	t("extention.minecraft-core.connectInfo", {
		host: serverRootPath,
		userCode: code,
	}),
);

app.get(
	"/mc",
	upgradeWebSocket((c) => ({
		onOpen: (message, ws) => {
			wss = ws;
			ws.send(JSON.stringify(commandMsg("/say Connected!")));
			console.log("Minectaft: ", t("generic.connected"));
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
	if (wss) {
		wss.send(JSON.stringify(subscribeMsg("PlayerTravelled")));
	} else {
		console.error("WebSocket is not connected.");
	}
});
onMessageEvents.push(async (message) => {
	const data = JSON.parse(message);
	if (data?.body && data.header.eventName === "PlayerTravelled") {
		minecraftWorldState.player = {
			position: {
				x: data.body.player.position.x,
				y: data.body.player.position.y,
				z: data.body.player.position.z,
			},
			isunderwater: data.body.player.isUnderwater,
		};
	}
});
