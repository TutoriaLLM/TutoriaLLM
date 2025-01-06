import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import { userColumns } from "./column";
import { authClient } from "@/libs/auth-client";
import { useEffect, useState } from "react";
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
import type { z } from "zod";
import type { userQuerySchema } from "@/routes/admin/users";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/libs/utils";

export function UserTable(props: {
	userId: string;
}) {
	const routeApi = getRouteApi("/admin/users");
	const search = routeApi.useSearch();
	const navigate = routeApi.useNavigate();
	const [data, setData] = useState<UserWithRole[]>([]);

	async function getUsers({
		page,
		limit,
		sortField,
		sortOrder,
		searchField,
		searchOperator,
		searchValue,
		role,
	}: z.infer<typeof userQuerySchema>) {
		const query: Record<string, any> = {
			limit: limit,
			offset: (page - 1) * limit,
			sortBy: sortField,
			sortDirection: sortOrder,
		};

		if (searchField) query.searchField = searchField;
		if (searchOperator) query.searchOperator = searchOperator;
		if (searchValue) query.searchValue = searchValue;
		if (role) {
			query.filterField = "role";
			query.filterValue = role;
			query.filterOperator = "eq";
		}

		return await authClient.admin.listUsers({
			fetchOptions: {},
			query,
		});
	}

	useEffect(() => {
		getUsers(search).then((users) => {
			setData(users.data?.users || []);
		});
	}, [search]);

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
		data,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		initialState: {
			sorting: [{ id: "id", desc: false }],
		},
	});
	return (
		<div>
			<div className="flex justify-between p-4">
				<h2 className="text-2xl font-semibold">Users</h2>
			</div>
			<div>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.column.id}
										onClick={() => handleSort(header.column.id)}
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
									No users found
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
							onClick={() => {
								navigate({
									search: (prev) => ({ ...prev, page: prev.page - 1 }),
								});
							}}
							disabled={search.page === 1}
							className={cn(
								search.page === 1 && "bg-gray-400 cursor-not-allowed",
							)}
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
							disabled={data.length < search.limit}
							className={cn(
								data.length < search.limit && "bg-gray-400 cursor-not-allowed",
							)}
						>
							<ChevronRight />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
