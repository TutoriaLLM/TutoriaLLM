import { UserTable } from "@/components/features/admin/tables/users/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { authClient } from "@/libs/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { z } from "zod";

export const userQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(z.string(), "id").default("id"),
	sortOrder: fallback(z.enum(["asc", "desc"]), "asc").default("asc"),
	searchField: z.enum(["name", "email"]).optional(),
	searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
	searchValue: z.string().optional(),
	role: z.string().optional(),
});

export const Route = createFileRoute("/admin/users")({
	component: Users, // This is the main
	validateSearch: zodValidator(userQuerySchema),
	shouldReload: true,
});

function Users() {
	const [currentUserId, setCurrentUserId] = useState<null | string>(null);
	const [newUser, setNewUser] = useState({
		username: "",
		email: "",
		password: "",
		role: "user",
	});
	async function handleNewUserChange(
		event: React.ChangeEvent<HTMLInputElement>,
	) {
		setNewUser((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	}

	async function handleSelectRole(event: React.ChangeEvent<HTMLSelectElement>) {
		setNewUser((prev) => ({
			...prev,
			role: event.target.value,
		}));
	}

	async function handleCreateUser() {
		await authClient.admin.createUser({
			name: newUser.username,
			email: newUser.email,
			password: newUser.password,
			role: newUser.role,
		});
		setNewUser({ username: "", password: "", email: "", role: "user" });
	}

	useEffect(() => {
		authClient.getSession().then((session) => {
			setCurrentUserId(session.data?.user.id ?? null);
		});
	}, []);

	return (
		<div className="w-full h-full p-2 md:p-4">
			<div className="overflow-x-auto bg-background border rounded-2xl ">
				<UserTable userId={currentUserId ?? ""} />
				<div className="p-2 border-b-2 bg-card">
					<h2 className="py-2 font-semibold">Create New User</h2>
					<form className="gap-2 flex">
						Username:
						<Input
							type="text"
							name="username"
							value={newUser.username}
							onChange={handleNewUserChange}
						/>
						Email:
						<Input
							type="email"
							name="email"
							value={newUser.email}
							onChange={handleNewUserChange}
						/>
						Password:
						<Input
							type="password"
							name="password"
							value={newUser.password}
							onChange={handleNewUserChange}
						/>
						Role:
						<Select
							name="role"
							value={newUser.role}
							onChange={handleSelectRole}
						>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</Select>
						<Button type="button" onClick={handleCreateUser}>
							Create
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
