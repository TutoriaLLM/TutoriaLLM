import type { Tutorial } from "@/type";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type TableState,
	useReactTable,
} from "@tanstack/react-table";
import { tutorialsColumns } from "./column";
import { useListTutorials } from "@/hooks/admin/tutorials";
import { getRouteApi } from "@tanstack/react-router";
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
import { useMemo } from "react";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
import { useTranslation } from "react-i18next";
export function TutorialsTable() {
	const routeApi = getRouteApi("/admin/tutorials");
	const search = routeApi.useSearch();
	const { t } = useTranslation();
	const navigate = routeApi.useNavigate();
	const { tutorials, isPending } = useListTutorials();

	const totalTutorials = tutorials?.length || 0;

	//This route using internal pagination / sorting
	//But using same search params as server-side route
	//prevent infinite loop by using useMemo
	//all states of sorting and pagination are stored in search params (not in local state)
	const searchParams = useMemo(
		() =>
			({
				pagination: {
					pageIndex: search.page - 1,
					pageSize: search.limit,
				},
				sorting: [
					{
						id: search.sortField,
						desc: search.sortOrder === "desc",
					},
				],
			}) satisfies Partial<TableState>,
		[search.page, search.limit, search.sortField, search.sortOrder],
	);

	//content and serializednodes are not fetched from tutorial list api
	type TutorialColumn = Omit<Tutorial, "content" | "serializednodes">;

	const table = useReactTable<TutorialColumn>({
		columns: tutorialsColumns(),
		data: tutorials || [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),

		state: searchParams,
	});

	const handleSort = (field: keyof TutorialColumn) => {
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

	return (
		<AdminBodyWrapper title={t("admin.tutorials")}>
			<div>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										onClick={() =>
											handleSort(header.column.id as keyof TutorialColumn)
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
						{!isPending && table.getRowModel().rows.length > 0 ? (
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
									{isPending ? "Loading..." : "No data"}
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
							disabled={search.page * search.limit >= totalTutorials}
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
										page: Math.ceil(totalTutorials / search.limit),
									}),
								});
							}}
							disabled={search.page * search.limit >= totalTutorials}
						>
							<ChevronsRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</AdminBodyWrapper>
	);
}
