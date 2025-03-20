import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/libs/auth-client";
import { updateUserSchema, type UpdateUserSchemaType } from "@/schema/auth";
import type { AuthSession } from "@/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/toast";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ErrorToastContent, SuccessToastContent } from "../../toastContent";

export function EditInfo(props: { session: AuthSession }) {
	const { session } = props;
	const { toast } = useToast();
	const { t } = useTranslation();
	const router = useRouter();
	const form = useForm<UpdateUserSchemaType>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: session.user.name,
			username: session.user.username || "",
		},
	});

	const onSubmitUserInfo = async (data: UpdateUserSchemaType) => {
		console.info(data);
		const result = await authClient.updateUser({
			name: data.name,
			username: data.username,
		});
		if (result.error) {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToCreateAccount")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		} else {
			toast({
				description: (
					<SuccessToastContent>{t("toast.updatedInfo")}</SuccessToastContent>
				),
			});
		}
		router.invalidate();
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmitUserInfo)}
				className="space-y-3 p-3 border rounded-2xl"
			>
				<div className="space-y-2 grow max-w-md">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>{t("login.displayName")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormDescription>
									{t("login.displayNameDescription")}
								</FormDescription>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>{t("login.userName")}</FormLabel>
									<FormMessage />
								</div>{" "}
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormDescription>
									{t("login.userNameDescription")}
								</FormDescription>
							</FormItem>
						)}
					/>
					<Button size={"default"} type="submit" className="max-w-sm">
						{t("login.update")}
					</Button>
				</div>
			</form>
		</Form>
	);
}
