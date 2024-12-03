import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";

export const getUserList = async () => {
	const response = await adminClient.admin.users.$get();
	return handleResponse(response);
};

const UserToCreate = adminClient.admin.users.$post;
type UserToCreate = InferRequestType<typeof UserToCreate>;
export const createUser = async (user: UserToCreate["json"]) => {
	const response = await adminClient.admin.users.$post({
		json: user,
	});
	return handleResponse(response);
};

const UserIdToGet = adminClient.admin.users[":id"].$get;
type UserIdToGet = InferRequestType<typeof UserIdToGet>;
export const getUser = async (id: UserIdToGet["param"]) => {
	const response = await adminClient.admin.users[":id"].$get({
		param: id,
	});
	return handleResponse(response);
};

const UserIdToUpdate = adminClient.admin.users[":id"].$put;
type UserIdToUpdate = InferRequestType<typeof UserIdToUpdate>;
export const updateUser = async (
	id: UserIdToUpdate["param"],
	user: UserIdToUpdate["json"],
) => {
	const response = await adminClient.admin.users[":id"].$put({
		param: id,
		json: user,
	});
	return handleResponse(response);
};

const UserIdToDelete = adminClient.admin.users[":id"].$delete;
type UserIdToDelete = InferRequestType<typeof UserIdToDelete>;
export const deleteUser = async (id: UserIdToDelete["param"]) => {
	const response = await adminClient.admin.users[":id"].$delete({
		param: id,
	});
	return handleResponse(response);
};
