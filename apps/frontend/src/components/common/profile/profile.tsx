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

	const UserActions = () => {
		return (
			<div className="flex items-center gap-3">
				<Button variant={"red"} size={"sm"} onClick={handleLogout}>
					<DoorOpenIcon className="w-5 h-5" />
					Logout
				</Button>
				<ProfileEditor session={session} />
			</div>
		);
	};
	const AnonymousUserActions = () => {
		return (
			<div className="flex items-center gap-3">
				<Button
					variant={"red"}
					size={"sm"}
					onClick={handleDeleteAnonymousAccount}
				>
					<DoorOpenIcon className="w-5 h-5" />
					Delete Account
				</Button>
				<CreateFromAnonymous session={session} />
			</div>
		);
	};
	return (
		<div className="flex flex-col rounded-3xl shadow p-3 w-full bg-gray-100 gap-3">
			<div className="flex gap-3 justify-left items-center">
				{session.user.image ? (
					<Avatar className="w-10 h-10 ">
						<AvatarImage src={session.user.image} />
						<AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
					</Avatar>
				) : (
					<BoringAvatar
						size="40px"
						className="w-10 h-10 rounded-full"
						name={session.user.id}
						variant="beam"
					/>
				)}
				<div className="flex flex-col gap-2">
					<p className="text-lg font-semibold">{session.user.name}</p>
					<p className="text-gray-600 text-xs inline-flex gap-2">
						<MailIcon className="w-4 h-4" />
						{session.user.email}
					</p>
				</div>
			</div>
			{isAnonymous ? <AnonymousUserActions /> : <UserActions />}
		</div>
	);
}
