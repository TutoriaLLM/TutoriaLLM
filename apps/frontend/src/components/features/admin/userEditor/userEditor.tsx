import { updateUserDetail } from "@/api/admin/users";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import { adminUpdateUserDetailSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

type AdminUpdateUserDetailType = z.infer<typeof adminUpdateUserDetailSchema>;

const UserEditorForm = ({
	userDetail,
	id,
}: { userDetail: AdminUpdateUserDetailType; id: string }) => {
	const { toast } = useToast();

	const { t } = useTranslation();
	const { mutate: put } = useMutation({
		mutationFn: updateUserDetail,
		onSuccess: () => {
			console.info("Updated user detail");
			toast({
				description: (
					<SuccessToastContent> {t("toast.updatedUser")}</SuccessToastContent>
				),
			});
		},
		onError: (e) => {
			console.error("Failed to update user detail", e);
			toast({
				description: (
					<ErrorToastContent>
						{" "}
						{t("toast.failedToUpdateUser")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		},
	});

	const form = useForm<AdminUpdateUserDetailType>({
		resolver: zodResolver(adminUpdateUserDetailSchema),
		defaultValues: {
			name: userDetail?.name,
			email: userDetail?.email,
			image: userDetail?.image || "",
			role: userDetail?.role || "",
			username: userDetail?.username || "",
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((user) => put({ id, user: user }))}
				className="space-y-3 p-3 max-w-md "
			>
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
							</div>
							<FormControl>
								<Input {...field} value={field.value ?? ""} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<div className="flex gap-2 items-center">
								<FormLabel>{t("login.email")}</FormLabel>
								<FormMessage />
							</div>
							<FormControl>
								<Input {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="image"
					render={({ field }) => (
						<FormItem>
							<div className="flex gap-2 items-center">
								<FormLabel>{t("login.image")}</FormLabel>
								<FormMessage />
							</div>
							<FormControl>
								<Input {...field} value={field.value ?? ""} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<div className="flex gap-2 items-center">
								<FormLabel>{t("admin.role")}</FormLabel>
								<FormMessage />
							</div>
							<FormControl>
								<Select {...field} value={field.value ?? ""}>
									<option value="admin">{t("admin.admin")}</option>
									<option value="user">{t("admin.user")}</option>
								</Select>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button type="submit" variant="secondary">
					{t("general.save")}
				</Button>
			</form>
		</Form>
	);
};

export function AdminUserEditor(props: {
	detail: AdminUpdateUserDetailType;
	id: string;
}) {
	const { detail, id } = props;

	return (
		<div>
			<UserEditorForm userDetail={detail} id={id} />
		</div>
	);
}
