import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import { userColumns } from "./column";
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
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
} from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
import { useUserList } from "@/hooks/admin/users";

export function UserTable(props: {
	userId: string;
}) {
	const routeApi = getRouteApi("/admin/users");
	const search = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const { users } = useUserList(search);

	function handleSort(field: string) {
		const newSortOrder =
			search.sortField === field && search.sortOrder === "asc" ? "desc" : "asc";
		navigate({
			search: {
				...search,
				sortField: field,
				sortOrder: newSortOrder,
			},
		});
	}

	const table = useReactTable<UserWithRole>({
		columns: userColumns(props.userId),
		data: users?.data?.users || [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		initialState: {
			sorting: [{ id: "id", desc: false }],
		},
	});
	return (
		<AdminBodyWrapper title="Users">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.column.id}
									onClick={() => {
										if (header.column.getCanSort()) {
											handleSort(header.column.id);
										}
									}}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{search.sortField === header.column.id &&
										(search.sortOrder === "asc" ? (
											<ChevronUp />
										) : (
											<ChevronDown />
										))}
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
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow key={0}>
							<TableCell colSpan={table.getAllColumns().length}>
								No users found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<Button
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: prev.page - 1 }),
								});
							}}
							disabled={search.page === 1}
						>
							<ChevronLeft />
						</Button>
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
							onClick={() => {
								navigate({
									search: (prev) => ({
										...prev,
										page: prev.page + 1,
									}),
								});
							}}
							disabled={(users?.data?.users?.length ?? 0) < search.limit}
						>
							<ChevronRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</AdminBodyWrapper>
	);
}
