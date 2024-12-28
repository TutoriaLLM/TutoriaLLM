import { Button } from "@/components/ui/button";
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
				return row.original.role;
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
