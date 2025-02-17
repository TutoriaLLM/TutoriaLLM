import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateAccountFromAnonymous } from "./create/createFromAnonymous";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export function CreateFromAnonymous() {
	const { t } = useTranslation();
	return (
		<div>
			<Dialog>
				<DialogTrigger asChild={true}>
					<Button size="sm">
						<Plus className="w-5 h-5" />
						{t("login.createAccount")}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("login.createAccount")}</DialogTitle>
						<DialogDescription>
							{t("login.createAccountDescription")}
						</DialogDescription>
					</DialogHeader>

					<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
						<CreateAccountFromAnonymous />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
