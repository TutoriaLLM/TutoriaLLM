import { authClient } from "@/libs/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
	component: Users, // This is the main
});

async function Users() {
	const [error, setError] = useState<string | null>(null);
	const [newUser, setNewUser] = useState({
		username: "",
		email: "",
		password: "",
		role: "user",
	});

	const data = await authClient.admin.listUsers({
		query: {
			limit: undefined,
		},
	});

	const currentUserId = (await authClient.getSession()).data?.user.id;

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

	async function handleDeleteUser(id: string) {
		await authClient.admin.removeUser({
			userId: id,
		});
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

	if (error) {
		alert(error);
		setError(null); // Reset error and continue display
	}

	return (
		<div className="overflow-x-auto bg-gray-300 rounded-2xl">
			<table className="min-w-full text-left text-sm whitespace-nowrap">
				<thead className="font-semibold border-b-2 border-gray-300">
					<tr>
						<th scope="col" className="px-6 py-4">
							User Name
						</th>
						<th scope="col" className="px-6 py-4">
							User ID
						</th>
						<th scope="col" className="px-6 py-4" />
					</tr>
				</thead>
				<tbody className="gap-2">
					{data.data?.users.map((user) => (
						<tr
							key={user.id}
							className="border-y-2 border-gray-300 rounded-2xl bg-gray-200 sentry-block"
						>
							<th className="px-6 py-4">{user.name}</th>

							<td className="px-6 py-4">{user.email}</td>
							<td className="px-6 py-4 border-l-2 border-gray-300">
								<span className="flex gap-2">
									<button
										type="button"
										className={`p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600 ${
											currentUserId === user.id ? "hidden" : "block"
										}`}
										onClick={() => handleDeleteUser(user.id)}
										disabled={currentUserId === user.id}
									>
										Delete
									</button>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
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
	);
}
