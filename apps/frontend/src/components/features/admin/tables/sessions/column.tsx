import { deleteSession } from "@/api/admin/session.js";
import {} from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {} from "@/hooks/admin/session.js";
import { langToStr } from "@/utils/langToStr";
import { msToTime, timeAgo } from "@/utils/time";
import { useMutation } from "@/hooks/useMutations";
import type { ColumnDef } from "@tanstack/react-table";
import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";
import UserCard from "../../userEditor/card";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "@/hooks/toast";
import { cn } from "@/libs/utils";
import { useTranslation } from "react-i18next";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import type { AdminSingleSession } from "@/type";

export function sessionColumns(
	setPopupSessionFromSessionId: (sessionId: string) => void,
) {
	const router = useRouter();
	const { t } = useTranslation();
	const handleStatsPopup = (sessionId: string | undefined) => {
		if (!sessionId) return;
		setPopupSessionFromSessionId(sessionId);
	};
	const { toast } = useToast();

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
			console.error("Failed to delete session:", error);
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToDeleteSession")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		},
	});

	function handleOpenUserInfo(id: string) {
		console.info("Open User Info", id);
		router.navigate({ to: `/admin/users/${id}` });
	}
	const handleDeleteSession = (key: string | undefined) => {
		if (!key) return;
		del({ sessionId: key });
	};
	const sessionColumns: ColumnDef<AdminSingleSession>[] = [
		{
			header: t("admin.user"),
			accessorKey: "userInfo",
			cell: ({ row }) => {
				return (
					<div>
						{typeof row.original.userInfo !== "string" &&
						row.original.userInfo ? (
							<UserCard
								image={row.original.userInfo.image}
								header={row.original.userInfo.username}
								subheader={row.original.userInfo.email}
								id={row.original.userInfo.id}
								onClick={() =>
									handleOpenUserInfo(
										row.original.userInfo &&
											typeof row.original.userInfo !== "string"
											? row.original.userInfo.id
											: row.original.userInfo || "",
									)
								}
							/>
						) : (
							row.original.userInfo || "No user information"
						)}
					</div>
				);
			},
		},
		{
			header: t("admin.projectName"),
			accessorKey: "name",
			cell: ({ row }) => {
				return (
					<div className="font-bold">
						{row.original.name || t("session.untitled")}
					</div>
				);
			},
		},
		{
			header: t("admin.sessionId"),
			accessorKey: "sessionId",
			cell: ({ row }) => {
				return (
					<div
						className={cn("text-base font-semibold flex", {
							"text-secondary font-bold": row.original?.clients?.[0],
							"text-foreground": !row.original?.clients?.[0],
						})}
					>
						{row.original.sessionId}
						{row.original?.clients?.[0] ? (
							<span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
						) : null}
						<span className="text-xs">{row.original?.clients?.length}</span>
					</div>
				);
			},
		},
		{
			header: t("admin.sessionLanguage"),
			accessorKey: "language",
			cell: ({ row }) => {
				return <div>{langToStr(row.original.language || "unknown")}</div>;
			},
		},
		{
			header: t("admin.createdTime"),
			accessorKey: "createdAt",
			cell: ({ row }) => {
				return (
					<>
						<p className="font-semibold text-sm">
							{row.original.createdAt ? timeAgo(row.original.createdAt) : "N/A"}
						</p>
						<p className="font-medium text-xs text-accent-foreground">
							{row.original.createdAt
								? new Date(row.original.createdAt).toLocaleString()
								: "N/A"}
						</p>
					</>
				);
			},
		},
		{
			header: t("admin.lastUpdatedTime"),
			accessorKey: "updatedAt",
			cell: ({ row }) => (
				<>
					<p className="font-semibold text-sm">
						{row.original.updatedAt ? timeAgo(row.original.updatedAt) : "N/A"}
					</p>
					<p className="font-medium text-xs text-accent-foreground">
						{row.original.updatedAt
							? new Date(row.original.updatedAt).toLocaleString()
							: "N/A"}
					</p>
				</>
			),
		},
		{
			header: t("admin.stats"),
			accessorKey: "stats",
			cell: ({ row }) => (
				<>
					<p className="font-medium text-xs  flex gap-1">
						<Bot className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalInvokedLLM : 0}
					</p>
					<p className="font-medium text-xs  flex gap-1">
						<Puzzle className="w-4 h-4" />
						{row.original.stats ? row.original.stats.currentNumOfBlocks : 0}
					</p>
					<p className="font-medium text-xs  flex gap-1 flex-nowrap">
						<Clock className="w-4 h-4" />
						{row.original.stats
							? msToTime(row.original.stats.totalConnectingTime)
							: 0}
					</p>
					<p className="font-medium text-xs  flex gap-1">
						<MessageCircleMore className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalUserMessages : 0}
					</p>
					<p className="font-medium text-xs  flex gap-1">
						<Play className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalCodeExecutions : 0}
					</p>
				</>
			),
		},
		{
			header: t("admin.actions"),
			accessorKey: "actions",
			cell: ({ row }) => (
				<span className="flex gap-2">
					<a href={`/${row.original.sessionId}`} className={buttonVariants()}>
						{t("general.open")}
					</a>
					<Button
						type="button"
						variant="secondary"
						onClick={() => handleStatsPopup(row.original.sessionId)}
					>
						{t("admin.stats")}
					</Button>

					<Button
						variant="destructive"
						onClick={() => handleDeleteSession(row.original.sessionId)}
					>
						{t("admin.deleteSession")}
					</Button>
				</span>
			),
		},
	];
	return sessionColumns;
}
