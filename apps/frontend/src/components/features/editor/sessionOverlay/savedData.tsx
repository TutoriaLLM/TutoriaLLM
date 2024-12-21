import { resumeSession } from "@/api/session.js";
import getImageFromSerializedWorkspace from "@/components/features/editor/generateImageURL";
import Popup from "@/components/ui/Popup.js";
import { useMutation } from "@/hooks/useMutations.js";
import type { SessionValuePost } from "@/type";
import { useRouter } from "@tanstack/react-router";
import type * as Blockly from "blockly";
import { openDB } from "idb";
import { Clock, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// IndexedDBをオープンする関数
const dbPromise = openDB("app-data", 1, {
	upgrade(db) {
		db.createObjectStore("sessions", { keyPath: "key" });
	},
});

export default function SavedData() {
	const [isSavedDataOpen, setIsSavedDataOpen] = useState(false);
	const [savedData, setSavedData] = useState<{
		[key: string]: { sessionValue: SessionValuePost; base64image: string };
	}>({});
	const { t } = useTranslation();
	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	const router = useRouter();

	function switchIsSavedDataOpen() {
		setIsSavedDataOpen(!isSavedDataOpen);
	}

	const { mutate } = useMutation({
		mutationFn: ({
			key,
			sessionData,
		}: { key: { key: string }; sessionData: SessionValuePost }) =>
			resumeSession(sessionData, key),
		onSuccess: (value) => {
			router.navigate({ to: `/${value.sessionCode}` });
		},
		onError: (error) => {
			console.error("Failed to create a new session:", error);
		},
	});

	// IndexedDBからセッションデータを取得する関数
	async function getSessionDataFromIndexedDB() {
		const db = await dbPromise;
		const allSessions = await db.getAll("sessions");
		const data: {
			[key: string]: { sessionValue: SessionValuePost; base64image: string };
		} = {};
		for (const session of allSessions) {
			const sessionValue = session.sessionValue as SessionValuePost;
			try {
				const imageURL = await getImageFromSerializedWorkspace(
					sessionValue.workspace ?? [],
					sessionValue.language ?? "en",
					hiddenWorkspaceRef,
					hiddenDivRef,
				);
				data[session.key] = {
					sessionValue: session.sessionValue,
					base64image: imageURL,
				};
			} catch (error) {
				console.error(
					`Failed to generate image for session ${session.key}:`,
					error,
				);
			}
		}
		return data;
	}

	// IndexedDBからセッションデータを削除する関数
	async function deleteSessionDataFromIndexedDB(key: string) {
		//keyはUUIDを指す
		const db = await dbPromise;
		await db.delete("sessions", key);
		//削除後、再度データを取得する
		const data = await getSessionDataFromIndexedDB();
		setSavedData(data);
	}

	async function createOrContinueSession(localSessionValue: SessionValuePost) {
		const sessionCode = localSessionValue.sessioncode;
		localSessionValue.workspace;
		mutate({ key: { key: sessionCode }, sessionData: localSessionValue });
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
		<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
			<h2 className="w-full font-bold text-2xl">{t("session.savedSession")}</h2>
			<div className="w-full h-full flex flex-col gap-3 flex-grow max-w-6xl">
				{Object.entries(savedData).map(([key, value]) => {
					return (
						<div
							key={key}
							className="w-full h-full flex-grow max-w-6xl bg-gray-200 p-2 rounded-2xl flex flex-col gap-2"
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
							<button
								type="button"
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-2xl"
								onClick={() => deleteSessionDataFromIndexedDB(key)}
							>
								{t("session.deleteSession")}
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
