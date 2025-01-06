import { PenIcon } from "lucide-react";
import { Button } from "../../ui/button";
import type { AuthSession } from "@/type";
import { EditPassword } from "./edit/editPassword";
import { Editinfo } from "./edit/editInfo";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
export function ProfileEditor({ session }: { session: AuthSession }) {
	return (
		<Dialog>
			<DialogTrigger asChild={true}>
				<Button variant={"default"} size={"sm"}>
					<PenIcon className="w-5 h-5" />
					Edit Profile
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Your Information</DialogTitle>
					<DialogDescription>Update your name and password.</DialogDescription>
					<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
						<Editinfo session={session} />

						<EditPassword />
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
