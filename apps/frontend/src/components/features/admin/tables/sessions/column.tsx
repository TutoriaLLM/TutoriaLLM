import { deleteSession } from "@/api/admin/session.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {} from "@/hooks/admin/session.js";
import type { SessionValue } from "@/type";
import { getInitials } from "@/utils/initial";
import { langToStr } from "@/utils/langToStr";
import { msToTime, timeAgo } from "@/utils/time";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import BoringAvatar from "boring-avatars";
import { Bot, Clock, MessageCircleMore, Play, Puzzle } from "lucide-react";

export function sessionColumns(
	setPopupSessionFromSessionId: (sessionId: string) => void,
) {
	const handleStatsPopup = (sessionId: string) => {
		setPopupSessionFromSessionId(sessionId);
	};

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
	const sessionColumns: ColumnDef<SessionValue>[] = [
		{
			header: "User",
			accessorKey: "userInfo",
			cell: ({ row }) => {
				return (
					<div className="max-w-xs">
						{typeof row.original.userInfo !== "string" &&
						row.original.userInfo ? (
							<div className="flex items-center gap-3 bg-gray-200 px-2 py-3 rounded-2xl overflow-clip">
								{row.original.userInfo?.image ? (
									<Avatar className="w-10 h-10 flex-shrink-0">
										<AvatarImage src={row.original.userInfo.image} />
										<AvatarFallback>
											{getInitials(row.original.userInfo.username)}
										</AvatarFallback>
									</Avatar>
								) : (
									<BoringAvatar
										size="40px"
										className="w-10 h-10 rounded-full flex-shrink-0"
										name={
											typeof row.original.userInfo === "string"
												? row.original.userInfo
												: row.original.userInfo?.id
										}
										variant="beam"
									/>
								)}
								<div className="">
									<p className="font-semibold text-gray-800">
										{row.original.userInfo.username}
									</p>
									<p
										className="text-xs text-gray-500 break-words"
										style={{ wordBreak: "break-word" }}
									>
										{row.original.userInfo.email}
									</p>
								</div>
							</div>
						) : (
							row.original.userInfo || "No user information"
						)}
					</div>
				);
			},
		},
		{
			header: "Session sessionId",
			accessorKey: "sessionId",
			cell: ({ row }) => {
				return (
					<div
						className={`text-base font-semibold flex ${
							row.original?.clients?.[0]
								? "text-green-700 font-bold"
								: "text-black"
						}`}
					>
						{row.original.sessionId}
						{row.original?.clients?.[0] ? (
							<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
						) : null}
						<span className="text-xs">{row.original?.clients?.length}</span>
					</div>
				);
			},
		},
		{
			header: "Session Language",
			accessorKey: "language",
			cell: ({ row }) => {
				return <div>{langToStr(row.original.language || "unknown")}</div>;
			},
		},
		{
			header: "Created at",
			accessorKey: "createdAt",
			cell: ({ row }) => {
				return (
					<>
						<p className="font-semibold text-sm">
							{row.original.createdAt ? timeAgo(row.original.createdAt) : "N/A"}
						</p>
						<p className="font-medium text-xs text-gray-600">
							{row.original.createdAt
								? new Date(row.original.createdAt).toLocaleString()
								: "N/A"}
						</p>
					</>
				);
			},
		},
		{
			header: "Last Update",
			accessorKey: "updatedAt",
			cell: ({ row }) => (
				<>
					<p className="font-semibold text-sm">
						{row.original.updatedAt ? timeAgo(row.original.updatedAt) : "N/A"}
					</p>
					<p className="font-medium text-xs text-gray-600">
						{row.original.updatedAt
							? new Date(row.original.updatedAt).toLocaleString()
							: "N/A"}
					</p>
				</>
			),
		},
		{
			header: "Stats",
			accessorKey: "stats",
			cell: ({ row }) => (
				<>
					<p className="font-medium text-xs text-gray-600 flex gap-1">
						<Bot className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalInvokedLLM : 0}
					</p>
					<p className="font-medium text-xs text-gray-600 flex gap-1">
						<Puzzle className="w-4 h-4" />
						{row.original.stats ? row.original.stats.currentNumOfBlocks : 0}
					</p>
					<p className="font-medium text-xs text-gray-600 flex gap-1 flex-nowrap">
						<Clock className="w-4 h-4" />
						{row.original.stats
							? msToTime(row.original.stats.totalConnectingTime)
							: 0}
					</p>
					<p className="font-medium text-xs text-gray-600 flex gap-1">
						<MessageCircleMore className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalUserMessages : 0}
					</p>
					<p className="font-medium text-xs text-gray-600 flex gap-1">
						<Play className="w-4 h-4" />
						{row.original.stats ? row.original.stats.totalCodeExecutions : 0}
					</p>
				</>
			),
		},
		{
			header: "Actions",
			accessorKey: "actions",
			cell: ({ row }) => (
				<span className="flex gap-2">
					<a href={`/${row.original.sessionId}`} className={buttonVariants()}>
						Open
					</a>
					<Button
						type="button"
						variant="orange"
						onClick={() => handleStatsPopup(row.original.sessionId)}
					>
						Stats
					</Button>

					<Button
						variant="red"
						onClick={() => handleDeleteSession(row.original.sessionId)}
					>
						Delete
					</Button>
				</span>
			),
		},
	];
	return sessionColumns;
}
