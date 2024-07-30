import { useEffect, useState } from "react";
import type { SessionValue } from "../../../../type.js";
import { langToStr } from "../../../../utils/langToStr.js";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Bot,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ChevronUp,
	Clock,
	MessageCircleMore,
	MoreHorizontal,
	Play,
	Puzzle,
} from "lucide-react";
import Popup from "../../Popup.js";
import { msToTime, timeAgo } from "../../../../utils/time.js";
import { SessionValueView } from "../../SessionValueView/index.js";

export default function Sessions() {
	const [sessions, setSessions] = useState<SessionValue[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [autoUpdate, setAutoUpdate] = useState(true);
	const [popupSession, setPopupSession] = useState<SessionValue | null>(null);

	const fetchSessions = () => {
		fetch("/api/admin/sessions/list")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				const parsedData = data.map((sessionString: string) =>
					JSON.parse(sessionString),
				);
				setSessions(parsedData);
				setLoading(false);
			})
			.catch((error) => {
				setError(error.message);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchSessions();
		let interval: NodeJS.Timeout | null = null;
		if (autoUpdate) {
			interval = setInterval(fetchSessions, 5000); // 5秒ごとにデータをフェッチ
		}
		return () => {
			if (interval) {
				clearInterval(interval); // クリーンアップ
			}
		};
	}, [autoUpdate]);

	const handleDeleteSession = (key: string) => {
		fetch(`/api/admin/sessions/${key}`, {
			method: "DELETE",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				setSessions(sessions.filter((session) => session.sessioncode !== key));
			})
			.catch((error) => {
				setError(error.message);
			});
	};

	async function handleStatsPopup(code: string) {
		await fetch(`/api/session/${code}`)
			.then(async (response) => {
				if (!response.ok || response.status === 404) {
					throw new Error(response.statusText);
				}
				// レスポンスをJSONに変換し、ポップアップで表示
				const data = (await response.json()) as SessionValue;
				setPopupSession(data);
			})
			.catch((error) => {
				setError(error.message);
			});
	}
	const handleClosePopup = () => {
		setPopupSession(null);
	};
	const PopupContent = popupSession ? (
		<SessionValueView session={popupSession} />
	) : (
		<div>Session not found</div>
	);

	const columns: ColumnDef<SessionValue>[] = [
		{
			header: "Session Code",
			accessorKey: "sessioncode",
			cell: ({ row }) => {
				return (
					<div
						className={`text-base font-semibold flex ${row.original?.clients[0] ? "text-green-700 font-bold" : "text-black"}`}
					>
						{row.original.sessioncode}
						{row.original?.clients[0] ? (
							<span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
						) : null}
						<span className="text-xs">{row.original?.clients.length}</span>
					</div>
				);
			},
		},
		{
			header: "Session Language",
			accessorKey: "language",
			cell: ({ row }) => {
				return <div>{langToStr(row.original.language)}</div>;
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
								? row.original.createdAt.toString()
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
						{row.original.updatedAt ? row.original.updatedAt.toString() : "N/A"}
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
					<a
						href={`/${row.original.sessioncode}`}
						className="p-1.5 rounded-full bg-sky-500 px-2 font-semibold text-white hover:bg-sky-600"
					>
						Open
					</a>
					<button
						type="button"
						className="p-1.5 rounded-full bg-orange-500 px-2 font-semibold text-white hover:bg-orange-600"
						onClick={() => handleStatsPopup(row.original.sessioncode)}
					>
						Stats
					</button>
					<button
						type="button"
						className="p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600"
						onClick={() => handleDeleteSession(row.original.sessioncode)}
					>
						Delete
					</button>
				</span>
			),
		},
	];

	const table = useReactTable<SessionValue>({
		columns,
		data: sessions,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			sorting: [
				{
					id: "createdAt",
					desc: false,
				},
			],
		},
	});

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		alert(error);
		setError(null); // エラーをリセットして表示を続行
	}

	return (
		<div className="w-full h-full">
			<Popup
				openState={popupSession !== null}
				onClose={handleClosePopup}
				Content={PopupContent}
			/>
			<div className="flex justify-between p-4 w-full">
				<h2 className="text-2xl font-semibold">Sessions</h2>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={autoUpdate}
						onChange={() => setAutoUpdate(!autoUpdate)}
						className="form-checkbox h-4 w-4 "
					/>
					<span>Auto Update</span>
				</label>
			</div>
			<div className="overflow-scroll">
				<table className="w-full text-left text-sm ">
					<thead className="font-semibold border-b-2 border-gray-300">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-4 cursor-pointer"
										onClick={header.column.getToggleSortingHandler()}
										onKeyUp={header.column.getToggleSortingHandler()}
										onKeyDown={header.column.getToggleSortingHandler()}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
										{header.column.getIsSorted() ? (
											header.column.getIsSorted() === "desc" ? (
												<ChevronDown />
											) : (
												<ChevronUp />
											)
										) : (
											""
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="gap-2">
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-6 py-4">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr
								key={0}
								className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
							>
								<td
									colSpan={columns.length}
									className="w-full flex justify-center items-center text-xl font-semibold text-center py-4"
								>
									No Session on this server...
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex p-2 justify-center items-center gap-2 bg-gray-300 shadow">
				<button
					type="button"
					className="p-2 rounded-full bg-sky-500 text-white font-semibold"
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronsLeft />
				</button>
				<button
					type="button"
					className="p-2 rounded-full bg-sky-500 text-white font-semibold"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft />
				</button>
				<button
					type="button"
					className="p-2 rounded-full bg-sky-500 text-white font-semibold"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight />
				</button>
				<button
					type="button"
					className="p-2 rounded-full bg-sky-500 text-white font-semibold"
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<ChevronsRight />
				</button>

				<select
					className="p-2 rounded-full bg-white text-gray-800 font-semibold"
					value={table.getState().pagination.pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
				>
					{[10, 20, 30, 40, 50].map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							{pageSize}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
