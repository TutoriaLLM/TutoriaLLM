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

export function UserAccount(props: { session: AuthSession }) {
	const { session } = props;
	const router = useRouter();
	async function handleLogout() {
		const result = await authClient.signOut();
		if (!result.data?.success || result.error) {
			console.error("Failed to logout");
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
			<div className="flex items-center gap-3">
				<Button variant="destructive" size="sm" onClick={handleLogout}>
					<DoorOpenIcon className="w-5 h-5" />
					Logout
				</Button>
				<ProfileEditor session={session} />
				{isAdmin && (
					<Button variant="secondary" size="sm" onClick={handleOpenAdmin}>
						<DoorOpenIcon className="w-5 h-5" />
						Admin
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
					Delete Account
				</Button>
				<CreateFromAnonymous />
			</div>
		);
	};

	return (
		<div
			className={cn(
				"flex flex-col rounded-3xl shadow p-3 w-full bg-gray-100 gap-3",
				isAdmin && "border-2 border-orange-500 shadow-orange-300",
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
						<p className="text-gray-600 text-xs truncate">
							{session.user.email}
						</p>
					</div>
				</div>
			</div>
			{isAnonymous ? <AnonymousUserActions /> : <UserActions />}
		</div>
	);
}
