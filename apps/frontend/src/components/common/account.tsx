import type { AuthSession } from "@/type";
import Avatar from "boring-avatars";
import { Button } from "../ui/button";
import { DoorOpenIcon, MailIcon, PenIcon } from "lucide-react";
import { authClient } from "@/libs/auth-client";
import { useRouter } from "@tanstack/react-router";

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
	return (
		<div className="flex flex-col rounded-3xl shadow p-3 w-full bg-gray-100 gap-3">
			<div className="flex gap-3 justify-left items-center">
				{session.user.image ? (
					<img
						src={session.user.image}
						alt="user"
						className="w-10 h-10 rounded-full"
					/>
				) : (
					<Avatar
						size="40px"
						className="w-10 h-10 rounded-full"
						name={session.user.name}
						variant="beam"
						square={true}
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
			<div className="flex items-center gap-3">
				<Button variant={"red"} size={"sm"} onClick={handleLogout}>
					<DoorOpenIcon className="w-5 h-5" />
					Logout
				</Button>
				<Button
					variant={"default"}
					size={"sm"}
					onClick={() => {
						console.log("edit profile");
					}}
				>
					<PenIcon className="w-5 h-5" />
					Edit Profile
				</Button>
			</div>
		</div>
	);
}
