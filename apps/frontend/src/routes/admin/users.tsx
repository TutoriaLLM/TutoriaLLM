import { UserTable } from "@/components/features/admin/tables/users/table";
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
			<div className="overflow-x-auto bg-gray-300 rounded-2xl ">
				<UserTable userId={currentUserId ?? ""} />
				<div className="p-2 border-b-2 border-gray-300 bg-gray-300">
					<h2 className="py-2 font-semibold">Create New User</h2>
					<form className="gap-2 flex">
						<label>
							Username:
							<input
								className="p-1.5 rounded-2xl bg-white"
								type="text"
								name="username"
								value={newUser.username}
								onChange={handleNewUserChange}
							/>
						</label>
						<label>
							Email:
							<input
								className="p-1.5 rounded-2xl bg-white"
								type="email"
								name="email"
								value={newUser.email}
								onChange={handleNewUserChange}
							/>
						</label>
						<label>
							Password:
							<input
								className="p-1.5 rounded-2xl bg-white"
								type="password"
								name="password"
								value={newUser.password}
								onChange={handleNewUserChange}
							/>
						</label>
						<label>
							Role:
							<select
								className="p-1.5 rounded-2xl bg-white"
								name="role"
								value={newUser.role}
								onChange={handleSelectRole}
							>
								<option value="admin">Admin</option>
								<option value="user">User</option>
							</select>
						</label>
						<button
							type="button"
							onClick={handleCreateUser}
							className="p-1.5 rounded-full bg-orange-500 px-2 font-semibold text-white hover:bg-orange-600"
						>
							Create
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
