import { authClient } from "@/libs/auth-client";
import * as Label from "@radix-ui/react-label";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "@/schema/auth";
import { Button } from "../ui/button";
export default function Login(props: { redirectTo: string }) {
	const { t } = useTranslation();

	const [loginWarning, setLoginWarning] = useState("");

	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginSchemaType>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const handleLogin = async (data: LoginSchemaType) => {
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
		const result = await signIn();
		if (result.data) {
			router.navigate({ to: props.redirectTo });
		} else {
			setLoginWarning(t("login.loginFailed"));
		}
	};

	const handleGuest = async () => {
		const user = await authClient.signIn.anonymous();
		if (user.data) {
			router.navigate({ to: props.redirectTo });
		} else {
			setLoginWarning(t("login.loginFailed"));
		}
	};

	return (
		<div>
			<form
				onSubmit={handleSubmit(handleLogin)}
				className="flex flex-col justify-center items-center gap-3 sentry-block"
			>
				{loginWarning === "" ? null : (
					<div className="p-1.5 py-2 bg-warning-foreground font-normal border rounded-2xl w-full h-full flex justify-center items-center">
						<CircleAlert className="w-10 h-10 text-warning mr-2 justify-center items-center" />
						<p className="text-left w-full">{loginWarning}</p>
					</div>
				)}

				<div className="w-full flex p-2 gap-3 items-center justify-between">
					<Label.Root
						className="text-md text-accent-foreground"
						htmlFor="username"
					>
						{t("login.username")}
						{errors.username && (
							<p className="text-destructive text-sm">
								{errors.username.message}
							</p>
						)}
					</Label.Root>

					<input
						id="username"
						className="w-[60%] max-w-80 p-2 border-2 border-gray-400 text-foreground rounded-2xl"
						{...register("username", { required: true })}
					/>
				</div>
				<div className="w-full flex p-2 flex-wrap gap-3 items-center justify-between">
					<Label.Root
						className="text-md text-accent-foreground"
						htmlFor="password"
					>
						{t("login.password")}
						{errors.password && (
							<p className="text-destructive text-sm">
								{errors.password.message}
							</p>
						)}
					</Label.Root>
					<input
						type="password"
						className="w-[60%] max-w-80 p-2 border-2 border-gray-400 text-foreground rounded-2xl"
						{...register("password", { required: true })}
					/>
				</div>
				<div className="w-full flex p-2 flex-wrap gap-4 items-center justify-center">
					<Button type="button" variant="outline" onClick={handleGuest}>
						Continue as guest
					</Button>
					<Button type="submit">{t("login.login")}</Button>
				</div>
			</form>
		</div>
	);
}
