import { getRouteApi, useRouter } from "@tanstack/react-router";
import { SessionByUserTable } from "../tables/sessionsByUser/table";
import BoringAvatar from "boring-avatars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/initial";
import {
	LucideVenetianMask,
	MailIcon,
	PenBox,
	Trash2,
	UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/libs/auth-client";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import { deleteSessionByUserId } from "@/api/admin/session";
import { useTranslation } from "react-i18next";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
export function AdminUserInfo({
	currentUserId,
}: { currentUserId: string | null }) {
	const routeApi = getRouteApi("/admin/users_/$userId");
	const router = useRouter();
	const { t } = useTranslation();
	const userDetail = routeApi.useLoaderData();
	const { toast } = useToast();

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
				<SuccessToastContent> {t("toast.deletedUser")}</SuccessToastContent>
			),
		});
		router.navigate({ to: "/admin/users" });
	}
	function handleOpenEditor(id: string) {
		console.info("Open User Editor", id);
		router.navigate({ to: `/admin/users/${id}/edit` });
	}
	return (
		<div className="space-y-4">
			<div className="flex justify-between">
				<div className="flex gap-2 bg-background rounded-2xl p-3 font-bold w-full overflow-clip">
					<div>
						{userDetail?.image ? (
							<Avatar className="w-40 h-40 ">
								<AvatarImage
									src={
										userDetail.image
											? `${import.meta.env.VITE_BACKEND_URL}${userDetail.image}`
											: undefined
									}
								/>
								<AvatarFallback>{getInitials(userDetail?.name)}</AvatarFallback>
							</Avatar>
						) : (
							<BoringAvatar
								size="160px"
								className="w-20 h-20 md:w-40 md:h-40 rounded-full"
								name={userDetail?.id}
								variant="beam"
							/>
						)}
					</div>
					<div className="space-y-2 w-full">
						<div className="w-full flex gap-2 justify-between text-background">
							{userDetail?.role === "admin" ? (
								<div className="border-warning text-warning border-2 rounded-full p-1 px-2.5">
									{t("admin.admin")}
								</div>
							) : (
								<div className=" border-primary text-primary border-2 rounded-full p-1 px-2.5">
									{t("admin.user")}
								</div>
							)}
							<div className="flex gap-2">
								<Button
									variant="destructive"
									size="icon"
									onClick={() => handleDeleteUser(userDetail?.id || "")}
									disabled={userDetail?.id === currentUserId}
									className={
										userDetail?.id === currentUserId
											? "cursor-not-allowed opacity-50"
											: ""
									}
								>
									<Trash2 />
								</Button>
								<Button
									variant="secondary"
									size="icon"
									onClick={() => handleOpenEditor(userDetail?.id || "")}
								>
									<PenBox />
								</Button>
							</div>
						</div>
						<h2 className="text-2xl">
							{userDetail?.isAnonymous ? (
								<p className="inline-flex">
									*Anonymous <LucideVenetianMask className="w-5 h-5" />
								</p>
							) : (
								<p className="">{userDetail?.name || t("admin.noName")}</p>
							)}
						</h2>
						<div className="text-accent-foreground flex gap-2 text-xs">
							<UserIcon className="w-4 h-4" />
							{userDetail?.username || t("admin.noUsername")}
						</div>
						<div className="text-accent-foreground flex gap-2 break-all text-xs">
							<MailIcon className="w-4 h-4" />
							{userDetail?.email || t("admin.noEmail")}
						</div>
						<div className="text-accent-foreground gap-2 text-xs">
							<p>
								{t("admin.createdTime")}
								{userDetail?.createdAt
									? new Date(userDetail.createdAt).toLocaleDateString()
									: t("admin.noDate")}
							</p>
							<p>
								{t("admin.lastUpdatedTime")}
								{userDetail?.updatedAt
									? new Date(userDetail.updatedAt).toLocaleDateString()
									: t("admin.noDate")}
							</p>
						</div>
					</div>
				</div>
			</div>
			<SessionByUserTable />
		</div>
	);
}
