import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { authClient } from "@/libs/auth-client";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import { PenBox, Trash2 } from "lucide-react";
import UserCard from "../../userEditor/card";

export function userColumns(
	currentUserId: string,
	handleOpenEditor: (id: string) => void,
	handleOpenUserInfo: (id: string) => void,
) {
	async function handleDeleteUser(id: string) {
		await authClient.admin.removeUser({
			userId: id,
		});
	}

	async function handleChangeRole(id: string, role: string) {
		await authClient.admin.setRole({ userId: id, role });
	}

	type userWithPlugins = UserWithRole & {
		username?: string;
		isAnonymous?: boolean;
	};

	const userColumns: ColumnDef<userWithPlugins>[] = [
		{
			header: "User",
			accessorKey: "name",
			cell: ({ row }) => {
				return (
					<UserCard
						image={row.original.image}
						header={row.original.name}
						subheader={row.original.email}
						isAnonymous={row.original.isAnonymous}
						id={row.original.id}
						onClick={() => handleOpenUserInfo(row.original.id)}
					/>
				);
			},
		},
		{
			header: "Username for login",
			accessorKey: "username",
			cell: ({ row }) => {
				return row.original.username ?? "No username";
			},
		},
		{
			header: "Created At",
			accessorKey: "createdAt",
			cell: ({ row }) => {
				return row.original.createdAt.toDateString();
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
						<Button
							variant={"orange"}
							onClick={() => handleOpenEditor(row.original.id)}
						>
							<PenBox />
						</Button>
					</div>
				);
			},
		},
	];
	return userColumns;
}
