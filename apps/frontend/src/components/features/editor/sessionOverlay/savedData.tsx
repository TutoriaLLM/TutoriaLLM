import { useEffect, useRef, useState } from "react";
import { deleteSession, resumeSession } from "@/api/session";
import getImageFromSerializedWorkspace from "@/components/features/editor/generateImageURL";
import { Button } from "@/components/ui/button";
import { useMutation } from "@/hooks/useMutations";
import type { SessionValue } from "@/type";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import type * as Blockly from "blockly";
import { Clock, PlayIcon, Search, Trash2 } from "lucide-react";
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";

export default function SavedData() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { sessions, isPending } = useUserSession();
	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	const router = useRouter();
	const { queryClient } = useRouteContext({
		from: "__root__",
	});

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
			queryClient.invalidateQueries({
				queryKey: ["userSessions"],
				refetchType: "all",
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

			for (const [_key, value] of Object.entries(sessions)) {
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
				<div className="w-full h-full justify-center items-start align-top gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
					{Object.entries(sessions ?? []).length === 0 ? (
						<div className="text-lg w-full text-center">
							{t("session.listSessionNotFound")}
						</div>
					) : (
						Object.entries(sessions ?? []).map(([key, value]) => {
							const thumbnail = thumbnailMap[value.sessionId];
							return (
								<Card
									key={key}
									className="w-full bg-card p-2 rounded-2xl space-y-2"
								>
									<CardHeader>
										{value.name ? (
											<h2 className="text-lg font-semibold">{value.name}</h2>
										) : (
											<h2 className="text-lg font-semibold">
												{t("session.untitled")}
											</h2>
										)}
										<CardDescription>
											<span className="flex gap-1">
												<Clock />
												<p>{dateToString(new Date(value.updatedAt))}</p>
											</span>
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-2">
										{thumbnail ? (
											<img
												src={thumbnail}
												alt="block"
												className="flex w-full h-full max-h-48 bg-gray-100 object-contain border rounded-2xl"
											/>
										) : (
											<div className="flex w-full h-48 items-center justify-center">
												<span>Loading...</span>
											</div>
										)}

										<div className="flex justify-between gap-2">
											<Button
												type="button"
												className="w-full"
												onClick={() => createOrContinueSession(value)}
												disabled={isPending}
											>
												<PlayIcon />
												{t("session.continueSession")}
											</Button>
											<Button
												type="button"
												className="w-full"
												variant="destructive"
												onClick={() => del({ key: value.sessionId })}
												disabled={isPending}
											>
												<Trash2 />
												{t("session.deleteSession")}
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
