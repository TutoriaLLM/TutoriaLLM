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
import { authClient } from "@/libs/auth-client";
import { createUserSchema, type CreateUserSchemaType } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export function CreateAccontFromAnonymous() {
	const router = useRouter();
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
			alert("Error creating account");
		}
		router.history.push("/");
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-2 p-3 rounded-3xl bg-gray-100 shadow"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Display Name</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>This is your display name.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>UserName</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>
								This is your user name for login.
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
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>Type your Email address.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>Type your password.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmpassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>Confirm your password.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					variant={"default"}
					size={"default"}
					type="submit"
					className="max-w-sm"
				>
					Create Account
				</Button>
			</form>
		</Form>
	);
}
