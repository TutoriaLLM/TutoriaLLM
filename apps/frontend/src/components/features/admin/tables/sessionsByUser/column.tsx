import { deleteSession } from "@/api/admin/session";
import { useMutation } from "@/hooks/useMutations";
import {} from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {} from "@/hooks/admin/session.js";
import type { SessionValue } from "@/type";
import { langToStr } from "@/utils/langToStr";
import { msToTime, timeAgo } from "@/utils/time";
import type { ColumnDef } from "@tanstack/react-table";
import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";
import { cn } from "@/libs/utils";
import { useTranslation } from "react-i18next";

export function sessionByUserColumns(
	setPopupSessionFromSessionId: (sessionId: string) => void,
) {
	const { t } = useTranslation();
	const { mutate: del } = useMutation({
		mutationFn: deleteSession,
		onSuccess: () => {
			alert("Session deleted successfully");
			//reload
		},
		onError: (error) => {
			alert("Failed to delete session");
			console.error("Failed to delete session:", error);
		},
	});

	const handleDeleteSession = (key: string) => {
		del({ sessionId: key });
	};
	const handleStatsPopup = (sessionId: string) => {
		setPopupSessionFromSessionId(sessionId);
	};

	const sessionColumns: ColumnDef<SessionValue>[] = [
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
