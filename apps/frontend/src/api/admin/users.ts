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

export const getUser = async ({ id }: { id: number }) => {
	const response = await adminClient.admin.users[":id"].$get({
		param: {
			id: id.toString(),
		},
	});
	return handleResponse(response);
};

const UserIdToUpdate = adminClient.admin.users[":id"].$put;
type UserIdToUpdate = InferRequestType<typeof UserIdToUpdate>;
export const updateUser = async ({
	id,
	user,
}: { id: number; user: UserIdToUpdate["json"] }) => {
	const response = await adminClient.admin.users[":id"].$put({
		param: {
			id: id.toString(),
		},
		json: user,
	});
	return handleResponse(response);
};

export const deleteUser = async ({ id }: { id: number }) => {
	const response = await adminClient.admin.users[":id"].$delete({
		param: {
			id: id.toString(),
		},
	});
	return handleResponse(response);
};
