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
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import { adminUpdateUserDetailSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type AdminUpdateUserDetailType = z.infer<typeof adminUpdateUserDetailSchema>;

const UserEditorForm = ({
	userDetail,
	id,
}: { userDetail: AdminUpdateUserDetailType; id: string }) => {
	const { toast } = useToast();

	const { mutate: put } = useMutation({
		mutationFn: updateUserDetail,
		onSuccess: () => {
			console.info("Updated user detail");
			toast({
				description: (
					<p className="flex items-center justify-center gap-2">
						<CheckCircle className="text-green-500" />
						User detail updated
					</p>
				),
			});
		},
		onError: (e) => {
			console.error("Failed to update user detail", e);
			toast({
				title: "Failed to update user",
				description: (
					<p className="flex items-center justify-center gap-2">
						<XCircle className="text-red-500" />
						Failed to update user
					</p>
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

				<Button type="submit" variant="secondary">
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
