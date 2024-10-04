import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "../../../../server/db/schema.js";

export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editUser, setEditUser] = useState<Partial<User>>({});
	const [newUser, setNewUser] = useState({ username: "", password: "" });
	const [currentUserID, setCurrentUserID] = useState(null);

	const fetchUsers = () => {
		fetch("/api/admin/users")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				setUsers(data);
				setLoading(false);
			})
			.catch((error) => {
				setError(error.message);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchUsers();

		// 現在のユーザー情報を取得
		fetch("/api/auth/session")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				console.log("userid", data.userId);
				setCurrentUserID(data.userId);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, []);

	const handleUserClick = (id: number) => {
		fetch(`/api/admin/users/${id}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				setSelectedUser(data);
				setEditUser(data);
			})
			.catch((error) => {
				setError(error.message);
			});
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditUser((prev) => ({ ...prev, [name]: value }));
	};

	const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewUser((prev) => ({ ...prev, [name]: value }));
	};

	const handleUpdateUser = () => {
		if (!editUser.username || (editUser.password && !editUser.password)) {
			console.error("Invalid user data");
			return;
		}
		if (selectedUser) {
			fetch(`/api/admin/users/${selectedUser.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(editUser),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(
							`Network response was not ok ${response.statusText}`,
						);
					}
					return response.json();
				})
				.then(() => {
					fetchUsers();
					setSelectedUser(null);
				})
				.catch((error) => {
					setError(error.message);
				});
		}
	};

	const handleDeleteUser = (id: number) => {
		if (currentUserID === id) {
			alert("You cannot delete the logged-in user.");
			return;
		}
		fetch(`/api/admin/users/${id}`, {
			method: "DELETE",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
			})
			.catch((error) => {
				setError(error.message);
			});
	};

	const handleCreateUser = () => {
		if (!newUser.username || !newUser.password) {
			console.error("Invalid user data");
			return;
		}
		fetch("/api/admin/users/new", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newUser),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				setUsers((prevUsers) => [...prevUsers, data]);
				setNewUser({ username: "", password: "" });
			})
			.catch((error) => {
				setError(error.message);
			});
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		alert(error);
		setError(null); // エラーをリセットして表示を続行
	}

	return (
		<div className="overflow-x-auto">
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
					{users.map((user) => (
						<tr
							key={user.id}
							className="border-y-2 border-gray-300 rounded-2xl bg-gray-200 sentry-block"
						>
							<th className="px-6 py-4">{user.username}</th>

							<td className="px-6 py-4">{user.id}</td>
							<td className="px-6 py-4 border-l-2 border-gray-300">
								<span className="flex gap-2">
									<button
										type="button"
										className="p-1.5 rounded-full bg-sky-500 px-2 font-semibold text-white hover:bg-sky-600"
										onClick={() => handleUserClick(user.id)}
									>
										View
									</button>
									<button
										type="button"
										className={`p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600 ${
											currentUserID === user.id ? "hidden" : "block"
										}`}
										onClick={() => handleDeleteUser(user.id)}
										disabled={currentUserID === user.id}
									>
										Delete
									</button>
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{selectedUser && (
				<div className="p-2 bg-gray-300 rounded-2xl">
					<button type="button" onClick={() => setSelectedUser(null)}>
						<X />
					</button>
					<form>
						<label>
							Username:
							<input
								type="text"
								name="username"
								value={editUser.username || ""}
								onChange={handleEditChange}
							/>
						</label>
						<label>
							New password (optional):
							<input
								type="password"
								name="password"
								value={editUser.password || ""}
								onChange={handleEditChange}
							/>
						</label>
						<button type="button" onClick={handleUpdateUser}>
							Update
						</button>
					</form>
				</div>
			)}

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
						Password:
						<input
							className="p-1.5 rounded-2xl bg-white"
							type="password"
							name="password"
							value={newUser.password}
							onChange={handleNewUserChange}
						/>
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
