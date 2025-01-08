import { Select } from "@/components/ui/select";
import { downloadAllSessions } from "@/api/admin/session.js";
import { SessionValueView } from "@/components/features/admin/SessionValueView/index.js";
import { Button } from "@/components/ui/button";
import { useListSessions } from "@/hooks/admin/session.js";
import type { SessionValue } from "@/type";
import {} from "@/utils/time";
import { getRouteApi } from "@tanstack/react-router";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronsLeft,
	ChevronsRight,
	LoaderCircle,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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

import { useState } from "react";
import { sessionColumns } from "./column";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "react-i18next";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
export function SessionTable() {
	const routeApi = getRouteApi("/admin/sessions");
	const search = routeApi.useSearch();
	const navigate = routeApi.useNavigate();

	const { t } = useTranslation();

	const [downloading, setDownloading] = useState(false);
	const [popupSessionFromSessionId, setPopupSessionFromSessionId] = useState<
		string | null
	>(null);
	const [autoUpdateMs, setAutoUpdateMs] = useState<number | false>(5000);
	const { sessions, isPending } = useListSessions(search, autoUpdateMs);
	const totalSessions = sessions?.total || 0;

	const PopupContent = popupSessionFromSessionId ? (
		<SessionValueView session={popupSessionFromSessionId} />
	) : (
		<div>{t("admin.sessionNotFound")}</div>
	);
	const handleDownloadAllSession = () => {
		setDownloading(true);
		downloadAllSessions().then((value) => {
			const blob = new Blob([JSON.stringify(value)], {
				type: "application/json",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `download-${new Date().toLocaleString()}.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			setDownloading(false);
		});
	};

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

	const table = useReactTable<SessionValue>({
		columns: sessionColumns(setPopupSessionFromSessionId),
		data: sessions?.sessions || [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		initialState: {
			sorting: [{ id: "updatedAt", desc: true }],
		},
	});

	return (
		<AdminBodyWrapper title={t("admin.sessions")}>
			<Dialog
				open={!!popupSessionFromSessionId}
				onOpenChange={(value) => {
					if (!value) {
						setPopupSessionFromSessionId(null);
					}
				}}
			>
				<DialogContent className="max-w-4xl h-full">
					<DialogHeader>
						<DialogTitle>{t("admin.sessionAnalytics")}</DialogTitle>
						<VisuallyHidden>
							<DialogDescription>
								{t("admin.sessionAnalyticsDialog")}
							</DialogDescription>
						</VisuallyHidden>
					</DialogHeader>
					{PopupContent}
				</DialogContent>
			</Dialog>

			<div className="">
				{isPending && (
					<span className="text-accent-foreground absolute top-5 right-5 animate-spin ">
						<LoaderCircle />
					</span>
				)}{" "}
				<div className="space-y-2 px-4">
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={typeof autoUpdateMs === "number"}
							onChange={() => setAutoUpdateMs(autoUpdateMs ? false : 5000)}
							className="form-checkbox h-4 w-4"
						/>
						<span>t("admin.autoUpdate")</span>
					</label>
					<button
						type="button"
						className="p-1 text-xs rounded-full text-foreground font-semibold"
						onClick={handleDownloadAllSession}
						disabled={downloading}
					>
						{downloading ? t("admin.downloading") : t("admin.downloadAll")}
					</button>
				</div>
			</div>
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
						</Button>{" "}
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
