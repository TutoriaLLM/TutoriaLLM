import { updateUserDetail } from "@/api/admin/users";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUserDetail } from "@/hooks/admin/users";
import { useMutation } from "@/hooks/useMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

//only for admin
//!!! DO NOT MAKE IT PUBLIC
const adminUpdateUserDetailSchema = z.object({
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	role: z.string().nullable(),
	username: z.string().nullable(),
});
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
			<form onSubmit={form.handleSubmit((user) => put({ id, user: user }))}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
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
							<FormLabel>Image</FormLabel>
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
							<FormLabel>Role</FormLabel>
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
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input {...field} value={field.value ?? ""} />
							</FormControl>
						</FormItem>
					)}
				/>
				<button type="submit">Submit</button>
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
