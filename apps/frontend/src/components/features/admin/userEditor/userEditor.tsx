import { updateUserDetail } from "@/api/admin/users";
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
import { useUserDetail } from "@/hooks/admin/users";
import { useMutation } from "@/hooks/useMutations";
import { adminUpdateUserDetailSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type AdminUpdateUserDetailType = z.infer<typeof adminUpdateUserDetailSchema>;

const UserEditorForm = ({
	userDetail,
	id,
}: { userDetail: AdminUpdateUserDetailType; id: string }) => {
	const { mutate: put } = useMutation({
		mutationFn: updateUserDetail,
		onSuccess: () => {
			console.log("Updated user detail");
		},
		onError: (e) => {
			console.error("Failed to update user detail", e);
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
								<FormLabel>Display Name</FormLabel>
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
								<FormLabel>Name for login</FormLabel>
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
								<FormLabel>Email</FormLabel>
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
								<FormLabel>Image</FormLabel>
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
								<FormLabel>Role</FormLabel>
								<FormMessage />
							</div>
							<FormControl>
								<select
									className="p-1.5 rounded-2xl bg-white"
									name="role"
									value={field.value ?? ""}
								>
									<option value="admin">Admin</option>
									<option value="user">User</option>
								</select>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button type="submit" variant={"orange"}>
					Submit
				</Button>
			</form>
		</Form>
	);
};

export function AdminUserEditor(props: { id: string }) {
	const { userDetail } = useUserDetail(props.id);

	if (!userDetail) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<UserEditorForm userDetail={userDetail} id={props.id} />
		</div>
	);
}
