import { useEffect, useRef, useState } from "react";
import { deleteSession, resumeSession } from "@/api/session";
import getImageFromSerializedWorkspace from "@/components/features/editor/generateImageURL";
import { Button } from "@/components/ui/button";
import { useMutation } from "@/hooks/useMutations";
import type { SessionValue } from "@/type";
import { useRouter } from "@tanstack/react-router";
import type * as Blockly from "blockly";
import { Clock, Search } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "react-i18next";
import { useUserSession } from "@/hooks/session";
import { useToast } from "@/hooks/toast";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";

export default function SavedData() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { sessions } = useUserSession();
	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	const router = useRouter();

	const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});

	const { mutate: resume } = useMutation({
		mutationFn: ({
			key,
			sessionData,
		}: { key: string; sessionData: SessionValue }) => {
			sessionData.updatedAt = new Date(sessionData.updatedAt).toISOString();
			sessionData.createdAt = new Date(sessionData.createdAt).toISOString();
			return resumeSession({ key });
		},
		onSuccess: (value) => {
			router.navigate({ to: `/${value.sessionId}` });
		},
		onError: (error, data) => {
			console.error("Failed to create a new session:", error);
			// 失敗したら削除を実行
			del({ key: data.key });
		},
	});

	const { mutate: del } = useMutation({
		mutationFn: deleteSession,
		onSuccess: () => {
			toast({
				description: (
					<SuccessToastContent>{t("toast.sessionDeleted")}</SuccessToastContent>
				),
			});
		},
		onError: (error) => {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToDeleteSession")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
			console.error("Failed to delete session:", error);
		},
	});

	// サムネイルを生成する関数
	async function getImageFromWorkspace(
		workspace: SessionValue["workspace"],
		language: string,
	) {
		try {
			const imageURL = await getImageFromSerializedWorkspace(
				workspace ?? [],
				language ?? "en",
				hiddenWorkspaceRef,
				hiddenDivRef,
			);
			return imageURL;
		} catch (error) {
			console.error("Failed to generate image for session", error);
			return "";
		}
	}

	// セッションを再開する
	function createOrContinueSession(value: SessionValue) {
		const sessionId = value.sessionId;
		resume({ key: sessionId, sessionData: value });
	}

	function dateToString(date: Date) {
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	}

	// 2. sessions が変わるたびにサムネイルを取得して、thumbnailMap に格納する
	useEffect(() => {
		if (!sessions) return;

		const loadThumbnails = async () => {
			const newThumbnailMap: Record<string, string> = {};

			for (const [key, value] of Object.entries(sessions)) {
				// すでにサムネイルが存在していない場合のみ取得
				if (!thumbnailMap[value.sessionId]) {
					const imageURL = await getImageFromWorkspace(
						value.workspace,
						"ja", // 言語を必要に応じて指定
					);
					newThumbnailMap[value.sessionId] = imageURL;
				}
			}

			// setThumbnailMap は、オブジェクトをマージする形で更新
			setThumbnailMap((prev) => ({
				...prev,
				...newThumbnailMap,
			}));
		};

		loadThumbnails();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessions]);

	return (
		<Dialog>
			<DialogTrigger>
				<Button>
					{t("session.findSavedSession")}
					<Search />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-6xl h-full">
				<DialogHeader>
					<DialogTitle>{t("session.savedSession")}</DialogTitle>
					<VisuallyHidden>
						<DialogDescription>
							{t("session.savedSessionDescription")}
						</DialogDescription>
					</VisuallyHidden>
				</DialogHeader>
				<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
					<div className="w-full h-full flex-col gap-3 flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
						{Object.entries(sessions ?? []).map(([key, value]) => {
							const thumbnail = thumbnailMap[value.sessionId];
							return (
								<div
									key={key}
									className="w-full h-full flex-grow bg-card p-2 rounded-2xl flex flex-col gap-2"
								>
									<span className="flex border-b gap-1">
										<Clock />
										<h3>{dateToString(new Date(value.updatedAt))}</h3>
									</span>
									{thumbnail ? (
										<img
											src={thumbnail}
											alt="block"
											className="flex w-full h-full max-h-48 object-contain"
										/>
									) : (
										<div className="flex w-full h-48 items-center justify-center">
											<span>Loading...</span>
										</div>
									)}

									<p className="text-xs font-base text-card-foreground">
										{value.sessionId}
									</p>

									<Button
										type="button"
										onClick={() => createOrContinueSession(value)}
									>
										{t("session.continueSession")}
									</Button>
									<Button
										type="button"
										variant="destructive"
										onClick={() => del({ key })}
									>
										{t("session.deleteSession")}
									</Button>
								</div>
							);
						})}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
