import { getRouteApi } from "@tanstack/react-router";
import { sessionByUserColumns } from "./column";
import { useListSessionsFromUserId } from "@/hooks/admin/session";
import {
	getCoreRowModel,
	useReactTable,
	flexRender,
} from "@tanstack/react-table";
import type { SessionValue } from "@/type";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import Popup from "@/components/ui/Popup";
import { SessionValueView } from "../../SessionValueView";
export function SessionByUserTable() {
	const routeApi = getRouteApi("/admin/users_/$userId");
	const { userId } = routeApi.useParams();
	const search = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const [popupSessionFromSessionId, setPopupSessionFromSessionId] = useState<
		string | null
	>(null);

	const { userSessions, isPending } = useListSessionsFromUserId(search, userId);
	const totalSessions = userSessions?.total || 0;

	const handleSort = (field: keyof SessionValue) => {
		const newSortOrder =
			search.sortField === field && search.sortOrder === "asc" ? "desc" : "asc";

		navigate({
			search: {
				...search,
				sortField: field,
				sortOrder: newSortOrder,
			},
		});
	};

	const handleClosePopup = () => {
		setPopupSessionFromSessionId(null);
	};

	const PopupContent = popupSessionFromSessionId ? (
		<SessionValueView session={popupSessionFromSessionId} />
	) : (
		<div>Session not found</div>
	);

	const table = useReactTable<SessionValue>({
		columns: sessionByUserColumns(setPopupSessionFromSessionId),
		data: userSessions?.sessions || [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		initialState: {
			sorting: [{ id: "updatedAt", desc: true }],
		},
	});

	return (
		<div className="w-full h-full overflow-auto bg-gray-300 rounded-2xl">
			<Popup
				openState={popupSessionFromSessionId !== null}
				onClose={handleClosePopup}
			>
				{PopupContent}
			</Popup>
			<div className="overflow--auto">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										onClick={() =>
											handleSort(header.column.id as keyof SessionValue)
										}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
										{search.sortField === header.column.id ? (
											search.sortOrder === "desc" ? (
												<ChevronDown />
											) : (
												<ChevronUp />
											)
										) : (
											""
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow key={0}>
								<TableCell colSpan={table.getAllColumns().length}>
									No session found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<Button
							type="button"
							className={
								search.page === 1
									? "bg-gray-400 cursor-not-allowed"
									: "bg-sky-500"
							}
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: 1 }),
								});
							}}
							disabled={search.page === 1}
						>
							<ChevronsLeft />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							type="button"
							className={
								search.page === 1
									? "bg-gray-400 cursor-not-allowed"
									: "bg-sky-500"
							}
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: search.page - 1 }),
								});
							}}
							disabled={search.page === 1}
						>
							<ChevronLeft />
						</Button>{" "}
					</PaginationItem>
					<PaginationItem>
						<Select
							value={search.limit}
							onChange={(e) => {
								navigate({
									search: (prev) => ({
										...prev,
										limit: Number(e.target.value),
										page: 1,
									}),
								});
							}}
						>
							{[5, 10, 20, 30, 40, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</Select>
					</PaginationItem>
					<PaginationItem>
						<Button
							type="button"
							className={
								search.page * search.limit >= totalSessions
									? "bg-gray-400 cursor-not-allowed"
									: "bg-sky-500"
							}
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: search.page + 1 }),
								});
							}}
							disabled={search.page * search.limit >= totalSessions}
						>
							<ChevronRight />
						</Button>{" "}
					</PaginationItem>

					<PaginationItem>
						<Button
							type="button"
							className={
								search.page * search.limit >= totalSessions
									? "bg-gray-400 cursor-not-allowed"
									: "bg-sky-500"
							}
							onClick={() => {
								navigate({
									search: (prev) => ({
										...prev,
										page: Math.ceil(totalSessions / search.limit),
									}),
								});
							}}
							disabled={search.page * search.limit >= totalSessions}
						>
							<ChevronsRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
