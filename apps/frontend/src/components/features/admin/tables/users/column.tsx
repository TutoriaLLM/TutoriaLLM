import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { authClient } from "@/libs/auth-client";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import { Trash2 } from "lucide-react";

export function userColumns(currentUserId: string) {
	async function handleDeleteUser(id: string) {
		await authClient.admin.removeUser({
			userId: id,
		});
	}

	async function handleChangeRole(id: string, role: string) {
		await authClient.admin.setRole({ userId: id, role });
	}

	const userColumns: ColumnDef<UserWithRole>[] = [
		{
			header: "User ID",
			accessorKey: "id",
			cell: ({ row }) => {
				return row.original.id;
			},
		},
		{
			header: "Username",
			accessorKey: "username",
			cell: ({ row }) => {
				return row.original.name;
			},
		},
		{
			header: "Email",
			accessorKey: "email",
			cell: ({ row }) => {
				return row.original.email;
			},
		},
		{
			header: "Role",
			accessorKey: "role",
			cell: ({ row }) => {
				return (
					<Select
						value={row.original.role ?? "unknown"}
						onChange={(e) => handleChangeRole(row.original.id, e.target.value)}
						disabled={row.original.id === currentUserId}
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</Select>
				);
			},
		},
		{
			header: "Actions",
			accessorKey: "actions",
			cell: ({ row }) => {
				return (
					<div className="flex gap-2">
						<Button
							variant={"red"}
							onClick={() => handleDeleteUser(row.original.id)}
							disabled={row.original.id === currentUserId}
							className={
								row.original.id === currentUserId
									? "cursor-not-allowed opacity-50"
									: ""
							}
						>
							<Trash2 />
						</Button>
					</div>
				);
			},
		},
	];
	return userColumns;
}
