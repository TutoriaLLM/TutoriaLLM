import * as Label from "@radix-ui/react-label";
import { CircleAlert } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Login() {
	const { t } = useTranslation();
	const usernameRef = React.useRef<HTMLInputElement>(null);
	const passwordRef = React.useRef<HTMLInputElement>(null);

	const [loginWarning, setLoginWarning] = useState("");

	const currentPage = window.location.href;

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const username = usernameRef.current?.value;
		const password = passwordRef.current?.value;

		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});
		if (response.status === 200) {
			window.location.href = currentPage;
		} else {
			setLoginWarning(t("login.loginFailed"));
		}
	};

	return (
		<form
			onSubmit={handleLogin}
			className="flex flex-col justify-center items-center gap-3"
		>
			{loginWarning === "" ? null : (
				<div className="p-1.5 py-2 bg-yellow-200 text-gray-600 font-normal border rounded-2xl w-full h-full flex justify-center items-center">
					<CircleAlert className="w-10 h-10 text-yellow-500 mr-2 justify-center items-center" />
					<p className="text-left w-full">{loginWarning}</p>
				</div>
			)}

			<div className="w-full flex p-2 flex-wrap gap-3 items-center justify-between">
				<Label.Root className="text-md text-gray-500" htmlFor="username">
					{t("login.username")}
				</Label.Root>
				<input
					className=" w-[60%] p-2 border-2 border-gray-400 text-gray-800 rounded-2xl"
					type="text"
					id="username"
					defaultValue="Pedro Duarte"
					ref={usernameRef}
				/>
			</div>
			<div className="w-full flex p-2 flex-wrap gap-3 items-center justify-between">
				<Label.Root className="text-md text-gray-500" htmlFor="password">
					{t("login.password")}
				</Label.Root>
				<input
					className=" w-[60%] p-2 border-2 border-gray-400 text-gray-800 rounded-2xl"
					type="password"
					id="password"
					defaultValue=""
					ref={passwordRef}
				/>
			</div>
			<button
				type="submit"
				className="bg-sky-500 justify-between hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-2xl flex transition-all items-center"
			>
				{t("login.login")}
			</button>
		</form>
	);
}
