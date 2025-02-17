import { getRouteApi } from "@tanstack/react-router";
import { sessionByUserColumns } from "./column";
import { useListSessionsFromUserId } from "@/hooks/admin/session";
import {
	getCoreRowModel,
	useReactTable,
	flexRender,
} from "@tanstack/react-table";
import type { AdminSingleSession, SessionValue } from "@/type";
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

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { SessionValueView } from "../../SessionValueView";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
import { useTranslation } from "react-i18next";
export function SessionByUserTable() {
	const routeApi = getRouteApi("/admin/users_/$userId");
	const { t } = useTranslation();
	const { userId } = routeApi.useParams();
	const search = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const [popupSessionFromSessionId, setPopupSessionFromSessionId] = useState<
		string | null
	>(null);

	const { userSessions } = useListSessionsFromUserId(search, userId);
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

	const PopupContent = popupSessionFromSessionId ? (
		<SessionValueView session={popupSessionFromSessionId} />
	) : (
		<div>{t("admin.notSelected")}</div>
	);

	const table = useReactTable<AdminSingleSession>({
		columns: sessionByUserColumns(setPopupSessionFromSessionId),
		data: userSessions?.sessions || [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		initialState: {
			sorting: [{ id: "updatedAt", desc: true }],
		},
	});

	return (
		<AdminBodyWrapper title={t("admin.sessionsForUser", { user: userId })}>
			<Dialog
				open={!!popupSessionFromSessionId}
				onOpenChange={(value) => {
					if (!value) {
						setPopupSessionFromSessionId(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("admin.sessionAnalytics")} </DialogTitle>
						<DialogDescription>
							{t("admin.sessionAnalyticsDialog")}
						</DialogDescription>
						{PopupContent}
					</DialogHeader>
				</DialogContent>
			</Dialog>

			<div className="overflow-auto">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										onClick={() => {
											if (header.column.getCanSort()) {
												handleSort(header.column.id as keyof SessionValue);
											}
										}}
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
									{t("admin.sessionNotFound")}
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
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: search.page + 1 }),
								});
							}}
							disabled={search.page * search.limit >= totalSessions}
						>
							<ChevronRight />
						</Button>
					</PaginationItem>

					<PaginationItem>
						<Button
							type="button"
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
		</AdminBodyWrapper>
	);
}
