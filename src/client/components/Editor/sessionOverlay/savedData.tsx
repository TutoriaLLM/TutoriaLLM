import { useRef, useState, useEffect } from "react";
import Popup from "../../ui/Popup.js";
import { Clock, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SessionValue } from "../../../../type.js";
import getImageFromSerializedWorkspace from "../generateImageURL.js";
import { openDB } from "idb";
import type * as Blockly from "blockly";

// IndexedDBをオープンする関数
const dbPromise = openDB("app-data", 1, {
	upgrade(db) {
		db.createObjectStore("sessions", { keyPath: "key" });
	},
});

export default function SavedData() {
	const [isSavedDataOpen, setIsSavedDataOpen] = useState(false);
	const [savedData, setSavedData] = useState<{
		[key: string]: { sessionValue: SessionValue; base64image: string };
	}>({});
	const { t } = useTranslation();
	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	function switchIsSavedDataOpen() {
		setIsSavedDataOpen(!isSavedDataOpen);
	}

	// IndexedDBからセッションデータを取得する関数
	async function getSessionDataFromIndexedDB() {
		const db = await dbPromise;
		const allSessions = await db.getAll("sessions");
		const data: {
			[key: string]: { sessionValue: SessionValue; base64image: string };
		} = {};
		for (const session of allSessions) {
			const sessionValue = session.sessionValue as SessionValue;
			const imageURL = await getImageFromSerializedWorkspace(
				sessionValue.workspace,

				sessionValue.language,
				hiddenWorkspaceRef,
				hiddenDivRef,
			);
			data[session.key] = {
				sessionValue: session.sessionValue,
				base64image: imageURL,
			};
		}
		return data;
	}

	// サーバー側で同じ番号かつ同じワークスペース内容のセッションが残っているか確認する
	async function createOrContinueSession(localSessionValue: SessionValue) {
		const sessionCode = localSessionValue.sessioncode;

		try {
			const response = await fetch(`/api/session/${sessionCode}`);

			if (response.status === 404) {
				// 404エラーの場合、新しいセッションを作成する
				console.log(
					`Session ${sessionCode} not found. Creating a new session.`,
				);
				await createNewSession(localSessionValue);
				return;
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const receivedSessionValue = (await response.json()) as
				| SessionValue
				| undefined;

			if (
				receivedSessionValue?.workspace.toString() ===
				localSessionValue.workspace.toString()
			) {
				window.location.href = `/${sessionCode}`;
				console.log(`continue session at ${sessionCode}`);
			} else {
				await createNewSession(localSessionValue);
			}
		} catch (error) {
			console.error("Failed to fetch session or create a new one:", error);
		}
	}

	async function createNewSession(localSessionValue: SessionValue) {
		try {
			const response = await fetch("/api/session/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(localSessionValue),
			});

			if (!response.ok) {
				throw new Error("Failed to create a new session");
			}

			const sessionCode = await response.text();
			window.location.href = `/${sessionCode}`;
		} catch (error) {
			console.error("Failed to create a new session from data:", error);
		}
	}

	useEffect(() => {
		async function fetchData() {
			const data = await getSessionDataFromIndexedDB();
			setSavedData(data);
		}

		fetchData();
	}, []); // Fetch data on initial mount

	function dateToString(date: Date) {
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	}

	const popupContent = (
		<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-scroll">
			<h2 className="w-[100vw] font-bold text-2xl">
				{t("session.savedSession")}
			</h2>
			<div className="w-full h-full flex flex-col gap-3 flex-grow max-w-3xl">
				{Object.entries(savedData).map(([key, value]) => {
					return (
						<div
							key={key}
							className="w-full h-full flex-grow max-w-3xl bg-gray-200 p-2 rounded-2xl flex flex-col gap-2"
						>
							<span className="flex border-b gap-1">
								<Clock />
								<h3>{dateToString(new Date(value.sessionValue.updatedAt))}</h3>
							</span>
							<img
								src={value.base64image}
								alt="block"
								className="flex w-full h-full max-h-48 object-contain"
							/>
							<p className="text-xs font-base text-gray-500">{key}</p>
							<p className="text-xs font-base text-gray-500">
								{value.sessionValue.sessioncode}
							</p>

							<button
								type="button"
								className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-2xl"
								onClick={() => createOrContinueSession(value.sessionValue)}
							>
								{t("session.continueSession")}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);

	return (
		<div className="">
			<button
				type="button"
				className={
					"bg-sky-500 justify-between hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-2xl flex transition-all items-center "
				}
				onClick={switchIsSavedDataOpen}
			>
				{t("session.findSavedSession")}
				<Search />
			</button>
			{isSavedDataOpen ? (
				<Popup
					openState={isSavedDataOpen}
					onClose={switchIsSavedDataOpen}
					Content={popupContent}
				/>
			) : null}
		</div>
	);
}
