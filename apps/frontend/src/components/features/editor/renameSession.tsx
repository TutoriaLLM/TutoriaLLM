import { updateSessionName } from "@/api/session";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import {
	renameSessionSchema,
	type RenameSessionSchemaType,
} from "@/schema/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { PenBoxIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function RenameSession({
	id,
	name,
}: { id: string; name: string | null }) {
	const { t } = useTranslation();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const form = useForm<RenameSessionSchemaType>({
		resolver: zodResolver(renameSessionSchema),
		defaultValues: {
			name: name || "",
		},
	});
	const { mutate } = useMutation({
		mutationFn: updateSessionName,
		onSuccess: () => {
			//Reload all sessiondata to reflect the changes
			queryClient.invalidateQueries({
				queryKey: ["session", id],
				refetchType: "all",
			});
			router.invalidate();
			toast({
				description: (
					<SuccessToastContent>
						{t("toast.updatedProjectName")}
					</SuccessToastContent>
				),
			});
		},
		onError: (error) => {
			console.error("Failed to update session name:", error);
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToUpdateProjectName")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		},
	});
	const onSubmit = (data: RenameSessionSchemaType) => {
		mutate({ key: id, sessionName: data.name });
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button variant="outline" size="sm">
					{name ? (
						name
					) : (
						<p className="text-accent-foreground/80">
							{t("navbar.addSessionName")}
						</p>
					)}
					<PenBoxIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("navbar.addSessionName")}</DialogTitle>
					<DialogDescription>
						{t("navbar.addSessionNameDescription")}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-3">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<Input {...field} />
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogClose>
								<Button type="submit">{t("general.save")}</Button>
							</DialogClose>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
