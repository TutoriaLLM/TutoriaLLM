import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

import { CreateAccontFromAnonymous } from "./create/createFromAnonymous";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
export function CreateFromAnonymous() {
	return (
		<div>
			<Dialog>
				<DialogTrigger asChild={true}>
					<Button variant={"default"} size={"sm"}>
						<Plus className="w-5 h-5" />
						Create Account
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Account</DialogTitle>
						<DialogDescription>
							Create account to save your data.
						</DialogDescription>
					</DialogHeader>

					<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
						<CreateAccontFromAnonymous />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
