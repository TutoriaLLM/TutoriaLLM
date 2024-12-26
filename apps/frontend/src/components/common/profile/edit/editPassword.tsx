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

export function EditPassword() {
	const form = useForm<UpdatePasswordSchemaType>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmitPassword = async (data: UpdatePasswordSchemaType) => {
		await authClient.changePassword({
			currentPassword: data.oldPassword,
			newPassword: data.newPassword,
			revokeOtherSessions: false,
		});
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmitPassword)}
				className="space-y-2 p-3 rounded-3xl bg-gray-100 shadow"
			>
				<h2 className="w-full font-bold text-2xl">Change password</h2>
				<div className="space-y-2 max-w-">
					<FormField
						control={form.control}
						name="oldPassword"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-2 items-center">
									<FormLabel>Old password</FormLabel>
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
									<FormLabel>New password</FormLabel>
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
									<FormLabel>Confirm password</FormLabel>
									<FormMessage />
								</div>
								<FormControl>
									<Input placeholder="shadcn" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<Button type="submit" className="max-w-sm">
						Update
					</Button>
				</div>
			</form>
		</Form>
	);
}
