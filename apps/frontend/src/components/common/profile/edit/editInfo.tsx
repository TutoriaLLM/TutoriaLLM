import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/libs/auth-client";
import { updateUserSchema, type UpdateUserSchemaType } from "@/schema/auth";
import type { AuthSession } from "@/type";
import { zodResolver } from "@hookform/resolvers/zod";
import BoringAvatar from "boring-avatars";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/initial";

export function Editinfo(props: { session: AuthSession }) {
	const { session } = props;
	const form = useForm<UpdateUserSchemaType>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: session.user.name,
			username: session.user.username || "",
		},
	});

	const onSubmitUserInfo = async (data: UpdateUserSchemaType) => {
		console.info(data);
		await authClient.updateUser({
			name: data.name,
			username: data.username,
		});
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmitUserInfo)}
				className="space-y-3 p-3 rounded-3xl bg-gray-100 shadow"
			>
				<h2 className="w-full font-bold text-2xl">Update your information</h2>
				<div className="flex gap-2 md:gap-4 items-start">
					{session.user.image ? (
						<Avatar className="w-20 h-20 ">
							<AvatarImage src={session.user.image} />
							<AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
						</Avatar>
					) : (
						<BoringAvatar
							size="40px"
							className="w-20 h-20 rounded-full"
							name={session.user.id}
							variant="beam"
							square={true}
						/>
					)}
					<div className="space-y-2 grow max-w-md">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<div className="flex gap-2 items-center">
										<FormLabel>Display Name</FormLabel>
										<FormMessage />
									</div>
									<FormDescription>This is your display name.</FormDescription>
									<FormControl>
										<Input placeholder="shadcn" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<div className="flex gap-2 items-center">
										<FormLabel>User Name</FormLabel>
										<FormMessage />
									</div>{" "}
									<FormDescription>
										This is your user name for login.
									</FormDescription>
									<FormControl>
										<Input placeholder="shadcn" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<Button
							variant={"default"}
							size={"default"}
							type="submit"
							className="max-w-sm"
						>
							Update
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
