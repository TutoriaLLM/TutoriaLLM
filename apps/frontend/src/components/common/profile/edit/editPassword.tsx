import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/libs/auth-client";
import {
	updatePasswordSchema,
	type UpdatePasswordSchemaType,
} from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/toast";
import { useTranslation } from "react-i18next";
import { ErrorToastContent, SuccessToastContent } from "../../toastContent";

export function EditPassword() {
	const { toast } = useToast();
	const { t } = useTranslation();

	const form = useForm<UpdatePasswordSchemaType>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmitPassword = async (data: UpdatePasswordSchemaType) => {
		const result = await authClient.changePassword({
			currentPassword: data.oldPassword,
			newPassword: data.newPassword,
			revokeOtherSessions: false,
		});
		if (result.error) {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToUpdatePassword")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		} else {
			toast({
				description: (
					<SuccessToastContent>
						{t("toast.updatedPassword")}
					</SuccessToastContent>
				),
			});
		}
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmitPassword)}
				className="space-y-2 p-3 border rounded-2xl"
			>
				<div className="space-y-2 max-w-">
					<FormField
						control={form.control}
						name="oldPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>{t("login.oldPassword")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input placeholder="shadcn" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>{t("login.newPassword")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input placeholder="shadcn" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>{t("login.confirmPassword")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input placeholder="shadcn" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<Button type="submit" className="max-w-sm">
						{t("login.update")}
					</Button>
				</div>
			</form>
		</Form>
	);
}
