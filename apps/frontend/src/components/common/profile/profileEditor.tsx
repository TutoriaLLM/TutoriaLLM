import { PenIcon } from "lucide-react";
import { Button } from "../../ui/button";
import type { AuthSession } from "@/type";
import { EditPassword } from "./edit/editPassword";
import { EditInfo } from "./edit/editInfo";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { EditIcon } from "./edit/editIcon";
export function ProfileEditor({ session }: { session: AuthSession }) {
	const { t } = useTranslation();
	return (
		<Dialog>
			<DialogTrigger asChild={true}>
				<Button size="sm">
					<PenIcon />
					{t("login.edit")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("login.editTitle")}</DialogTitle>
					<DialogDescription>{t("login.editDescription")}</DialogDescription>
					<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
						<EditIcon session={session} />
						<EditInfo session={session} />
						<EditPassword />
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
