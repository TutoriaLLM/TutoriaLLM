import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/toast";
import { authClient } from "@/libs/auth-client";
import { createUserSchema, type CreateUserSchemaType } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function CreateAccontFromAnonymous() {
	const router = useRouter();
	const { toast } = useToast();
	const { t } = useTranslation();
	const form = useForm<CreateUserSchemaType>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			email: "",
			username: "",
			name: "",
			password: "",
			confirmpassword: "",
		},
	});

	const onSubmit = async (data: CreateUserSchemaType) => {
		const result = await authClient.signUp.email({
			email: data.email,
			name: data.username,
			password: data.password,
			username: data.username,
		});
		if (result.error) {
			console.error(result.error);
			toast({
				description: t("toast.failedToCreateAccount"),
			});
		}
		router.history.push("/");
	};

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
								{t("login.displayNameDescription")}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.username")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								{t("login.userNameDescription")}
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
							<FormDescription>{t("login.emailDescription")}</FormDescription>

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
								<Input {...field} />
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
					name="confirmpassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("login.confirmPassword")}</FormLabel>
							<FormControl>
								<Input {...field} />
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
}
