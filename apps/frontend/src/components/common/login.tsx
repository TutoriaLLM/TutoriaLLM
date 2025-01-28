import { authClient } from "@/libs/auth-client";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "@/schema/auth";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { errorMessageByCode } from "@/utils/betterAuthErrorTranslations";
export default function Login(props: { redirectTo: string }) {
	const { t } = useTranslation();

	const [loginWarning, setLoginWarning] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false); // 追加

	const router = useRouter();

	const form = useForm<LoginSchemaType>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const handleLogin = async (data: LoginSchemaType) => {
		setIsSubmitting(true); // ボタンを非活性化
		function signIn() {
			if (z.string().email().safeParse(data.username).success) {
				return authClient.signIn.email({
					email: data.username,
					password: data.password,
				});
			}
			return authClient.signIn.username({
				username: data.username,
				password: data.password,
			});
		}
		const { data: result, error } = await signIn();
		if (result) {
			router.navigate({ to: props.redirectTo });
		} else if (error) {
			try {
				console.error(error);
				setLoginWarning(
					`${t("login.loginFailed")}: ${errorMessageByCode({
						status: error.code || "",
						t,
					})}`,
				);
			} catch {
				setLoginWarning(t("login.loginFailed"));
			}
		}
		setIsSubmitting(false); // ボタンを再活性化
	};

	const handleGuest = async () => {
		setIsSubmitting(true); // ボタンを非活性化
		const user = await authClient.signIn.anonymous();
		if (user.data) {
			router.navigate({ to: props.redirectTo });
		} else {
			setLoginWarning(t("login.loginFailed"));
		}
		setIsSubmitting(false); // ボタンを再活性化
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleLogin)}
				className="flex flex-col justify-center items-center gap-3 sentry-block"
			>
				{loginWarning === "" ? null : (
					<div className="p-1.5 py-2 bg-warning-foreground font-normal border rounded-2xl w-full h-full flex justify-center items-center">
						<CircleAlert className="w-10 h-10 text-warning mr-2 justify-center items-center" />
						<p className="text-left w-full">{loginWarning}</p>
					</div>
				)}

				<div className="w-full flex p-2 gap-3 items-center justify-between">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem className="flex snap-start justify-between items-start w-full">
								<div className="space-y-2 items-center">
									<FormLabel>{t("login.username")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input {...field} className="w-[60%] max-w-80 min-w-40" />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
				<div className="w-full flex p-2 flex-wrap gap-3 items-center justify-between">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="flex snap-start justify-between items-start w-full">
								<div className="space-y-2 items-center">
									<FormLabel>{t("login.password")}</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input
										{...field}
										type="password"
										className="w-[60%] max-w-80 min-w-40 align-top"
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
				<div className="w-full flex p-2 flex-wrap gap-4 items-center justify-center">
					<Button
						type="button"
						variant="outline"
						onClick={handleGuest}
						disabled={isSubmitting}
					>
						{t("login.continueAsGuest")}
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{t("login.login")}
					</Button>
				</div>
			</form>
		</Form>
	);
}
