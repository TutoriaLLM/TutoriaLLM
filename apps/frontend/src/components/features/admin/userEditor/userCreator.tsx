import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { useToast } from "@/hooks/toast";
import { authClient } from "@/libs/auth-client";
import { adminCreateUserDetailSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
type AdminCreateUserDetailType = z.infer<typeof adminCreateUserDetailSchema>;

const UserCreatorForm = () => {
	const { toast } = useToast();

	const { t } = useTranslation();

	const form = useForm<AdminCreateUserDetailType>({
		resolver: zodResolver(adminCreateUserDetailSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "user",
		},
	});

	async function onSubmit(data: AdminCreateUserDetailType) {
		console.log("onSubmit", data);
		const result = await authClient.admin.createUser({
			name: data.name,
			email: data.email,
			password: data.password,
			role: data.role,
		});
		if (result.error) {
			console.error(result.error);
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
					<SuccessToastContent>{t("toast.createdUser")}</SuccessToastContent>
				),
			});
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-2 p-3 border rounded-2xl"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.displayName")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								{t("admin.displayNameDescription")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.email")}</FormLabel>

							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>{t("admin.emailDescription")}</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.password")}</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormDescription>
								{t("login.passwordDescription")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.confirmPassword")}</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormDescription>
								{t("login.confirmPasswordDescription")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button size="default" type="submit" className="max-w-sm">
					{t("login.createAccount")}
				</Button>
			</form>
		</Form>
	);
};

export function AdminUserCreator() {
	return (
		<div>
			<UserCreatorForm />
		</div>
	);
}
