import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { authClient } from "@/libs/auth-client";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins/admin";
import { CheckCircle, PenBox, Trash2, XCircleIcon } from "lucide-react";
import UserCard from "../../userEditor/card";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import { deleteSessionByUserId } from "@/api/admin/session";
import { useTranslation } from "react-i18next";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { useQueryClient } from "@tanstack/react-query";

export function userColumns(currentUserId: string) {
	const router = useRouter();
	const { toast } = useToast();

	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { mutate: del } = useMutation({
		mutationFn: deleteSessionByUserId,
	});

	async function handleDeleteUser(id: string) {
		//delete all sessions for user
		del(id);
		const result = await authClient.admin.removeUser({
			userId: id,
		});
		if (!result.data?.success || result.error) {
			toast({
				description: (
					<ErrorToastContent>{t("toast.failedToDeleteUser")}</ErrorToastContent>
				),
				variant: "destructive",
			});

			return;
		}
		toast({
			description: (
				<SuccessToastContent>{t("toast.deletedUser")}</SuccessToastContent>
			),
		});
		queryClient.invalidateQueries({
			queryKey: ["users"],
			refetchType: "active",
		});
	}

	async function handleChangeRole(id: string, role: string) {
		const result = await authClient.admin.setRole({ userId: id, role });
		if (result.error) {
			console.error("Failed to update role");
			toast({
				description: (
					<p className="flex items-center justify-center gap-2">
						<XCircleIcon className="text-destructive" />
						{t("toast.failedToUpdateRole")}
					</p>
				),
				variant: "destructive",
			});

			return;
		}

		toast({
			description: (
				<p className="flex items-center justify-center gap-2">
					<CheckCircle className="text-secondary" />
					{t("toast.updatedRole")}
				</p>
			),
		});
		queryClient.invalidateQueries({
			queryKey: ["users"],
			refetchType: "active",
		});
	}

	type userWithPlugins = UserWithRole & {
		username?: string;
		isAnonymous?: boolean;
	};

	function handleOpenUserInfo(id: string) {
		console.info("Open User Info", id);
		router.navigate({ to: `/admin/users/${id}` });
	}

	function handleOpenEditor(id: string) {
		console.info("Open User Editor", id);
		router.navigate({ to: `/admin/users/${id}/edit` });
	}

	const userColumns: ColumnDef<userWithPlugins>[] = [
		{
			header: t("admin.user"),
			accessorKey: "name",
			cell: ({ row }) => {
				return (
					<UserCard
						image={
							row.original.image
								? `${import.meta.env.VITE_BACKEND_URL}${row.original.image}`
								: undefined
						}
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
			header: t("admin.username"),
			accessorKey: "username",
			cell: ({ row }) => {
				return row.original.username ?? "No username";
			},
		},
		{
			header: t("admin.createdTime"),
			accessorKey: "createdAt",
			cell: ({ row }) => {
				return row.original.createdAt.toDateString();
			},
		},
		{
			header: t("admin.role"),
			accessorKey: "role",
			cell: ({ row }) => {
				return (
					<Select
						value={row.original.role ?? "unknown"}
						onChange={(e) => handleChangeRole(row.original.id, e.target.value)}
						disabled={row.original.id === currentUserId}
					>
						<option value="user">{t("admin.user")}</option>
						<option value="admin">{t("admin.admin")}</option>
					</Select>
				);
			},
		},
		{
			header: t("admin.actions"),
			accessorKey: "actions",
			enableSorting: false,

			cell: ({ row }) => {
				return (
					<div className="flex gap-2">
						<Button
							variant="destructive"
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
							variant="secondary"
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
