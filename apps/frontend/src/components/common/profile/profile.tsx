import type { AuthSession } from "@/type";
import BoringAvatar from "boring-avatars";
import { Button } from "../../ui/button";
import { DoorOpenIcon, MailIcon } from "lucide-react";
import { authClient } from "@/libs/auth-client";
import { useRouter } from "@tanstack/react-router";
import { ProfileEditor } from "./profileEditor";
import { CreateFromAnonymous } from "./createFromAnon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/initial";
import { cn } from "@/libs/utils";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export function UserAccount(props: { session: AuthSession }) {
	const { session } = props;
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	async function handleSignout() {
		const result = await authClient.signOut();
		queryClient.invalidateQueries({
			refetchType: "all",
		});
		if (!result.data?.success || result.error) {
			console.error("Failed to signout");
			return;
		}
		router.history.push("/login");
	}
	const isAnonymous = session.user.isAnonymous;
	const isAdmin = session.user.role === "admin";

	async function handleDeleteAnonymousAccount() {
		if (!isAnonymous) {
			return;
		}
		const result = await authClient.signOut();
		if (!result.data?.success || result.error) {
			console.error("Failed to delete account");
			return;
		}
		router.history.push("/login");
	}

	function handleOpenAdmin() {
		router.history.push("/admin");
	}

	const UserActions = () => {
		return (
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="destructive" size="sm" onClick={handleSignout}>
					<DoorOpenIcon className="w-5 h-5" />
					{t("login.signout")}
				</Button>
				<ProfileEditor session={session} />
				{isAdmin && (
					<Button variant="secondary" size="sm" onClick={handleOpenAdmin}>
						<DoorOpenIcon className="w-5 h-5" />
						{t("admin.title")}
					</Button>
				)}
			</div>
		);
	};
	const AnonymousUserActions = () => {
		return (
			<div className="flex gap-3 flex-wrap sm:flex-nowrap justify-center items-center">
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDeleteAnonymousAccount}
				>
					<DoorOpenIcon className="w-5 h-5" />
					{t("login.deleteAccount")}
				</Button>
				<CreateFromAnonymous />
			</div>
		);
	};

	return (
		<div
			className={cn(
				"flex flex-col rounded-3xl shadow border p-3 w-full bg-background gap-3",
				isAdmin && "border-2 border-warning shadow-warning",
			)}
		>
			<div className="flex gap-3 items-center">
				{session.user.image ? (
					<Avatar className="w-10 h-10 shrink-0">
						<AvatarImage src={session.user.image} />
						<AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
					</Avatar>
				) : (
					<BoringAvatar
						className="w-10 h-10 rounded-full shrink-0"
						name={session.user.id}
						variant="beam"
					/>
				)}
				<div className="space-y-2 overflow-hidden">
					<p className="text-lg font-semibold">{session.user.name}</p>
					<div className="flex gap-2">
						<MailIcon className="w-4 h-4 shrink-0" />
						<p className="text-accent-foreground text-xs truncate">
							{session.user.email}
						</p>
					</div>
				</div>
			</div>
			{isAnonymous ? <AnonymousUserActions /> : <UserActions />}
		</div>
	);
}
