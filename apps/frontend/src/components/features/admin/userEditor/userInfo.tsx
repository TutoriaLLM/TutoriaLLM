import { getRouteApi, useRouter } from "@tanstack/react-router";
import { SessionByUserTable } from "../tables/sessionsByUser/table";
import { useUserDetail } from "@/hooks/admin/users";
import BoringAvatar from "boring-avatars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/initial";
import {
	CheckCircle,
	LucideVenetianMask,
	MailIcon,
	PenBox,
	Trash2,
	UserIcon,
	XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/libs/auth-client";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import { deleteSessionByUserId } from "@/api/admin/session";
export function AdminUserInfo({
	currentUserId,
}: { currentUserId: string | null }) {
	const routeApi = getRouteApi("/admin/users_/$userId");
	const router = useRouter();
	const { userId } = routeApi.useParams();
	const { userDetail } = useUserDetail(userId);
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
			console.error("Failed to delete user");
			toast({
				description: (
					<p className="flex items-center justify-center gap-2">
						<XCircleIcon className="text-red-500" />
						Failed to delete user
					</p>
				),
				variant: "destructive",
			});

			return;
		}
		toast({
			description: (
				<p className="flex items-center justify-center gap-2">
					<CheckCircle className="text-green-500" />
					User deleted
				</p>
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
				<div className="flex gap-2 bg-gray-300 rounded-2xl p-3 justify-center items-center font-bold">
					<div>
						{userDetail?.image ? (
							<Avatar className="w-40 h-40 ">
								<AvatarImage src={userDetail?.image} />
								<AvatarFallback>{getInitials(userDetail?.name)}</AvatarFallback>
							</Avatar>
						) : (
							<BoringAvatar
								size="160px"
								className="w-40 h-40 rounded-full"
								name={userDetail?.id}
								variant="beam"
							/>
						)}
					</div>
					<div className="space-y-2">
						<div className="w-full flex gap-2 justify-between text-white">
							{userDetail?.role === "admin" ? (
								<div className="border-orange-500 text-orange-600 border-2 rounded-full p-1 px-2.5">
									Admin
								</div>
							) : (
								<div className=" border-gray-500 text-gray-600 border-2 rounded-full p-1 px-2.5">
									User
								</div>
							)}
							<div className="flex gap-2">
								<Button
									variant="red"
									size="sm"
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
									variant="orange"
									size="sm"
									onClick={() => handleOpenEditor(userDetail?.id || "")}
								>
									<PenBox />
								</Button>
							</div>
						</div>
						<h2 className="text-2xl">
							{userDetail?.isAnonymous ? (
								<p className="text-orange-700 inline-flex">
									Anonymous <LucideVenetianMask className="w-5 h-5" />
								</p>
							) : (
								<p className="text-gray-800">{userDetail?.name || "No name"}</p>
							)}
						</h2>
						<div className="text-gray-500 flex gap-2">
							<UserIcon />
							{userDetail?.username || "No username"}
						</div>
						<div className="text-gray-500 flex gap-2">
							<MailIcon />
							{userDetail?.email || "No email"}
						</div>
						<div className="text-gray-500 gap-2 text-xs">
							<p>
								{" "}
								created at:{" "}
								{userDetail?.createdAt
									? new Date(userDetail.createdAt).toLocaleDateString()
									: "No date"}
							</p>
							<p>
								update at:{" "}
								{userDetail?.updatedAt
									? new Date(userDetail.updatedAt).toLocaleDateString()
									: "No date"}
							</p>
						</div>
					</div>
				</div>
			</div>
			<SessionByUserTable />
		</div>
	);
}
