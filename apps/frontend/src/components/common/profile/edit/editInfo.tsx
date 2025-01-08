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
import { useToast } from "@/hooks/toast";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function Editinfo(props: { session: AuthSession }) {
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
				description: t("toast.failedToUpdateInfo"),
			});
		} else {
			toast({
				description: t("toast.updatedInfo"),
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
				</div>
			</form>
		</Form>
	);
}
