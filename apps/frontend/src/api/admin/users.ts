import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";

export const getUserDetail = async ({ id }: { id: string }) => {
	const response = await adminClient.admin.users[":id"].$get({
		param: {
			id: id.toString(),
		},
	});

	return handleResponse(response);
};

const UpdateUserDetail = adminClient.admin.users[":id"].$put;
type UpdateUserDetail = InferRequestType<typeof UpdateUserDetail>;
export const updateUserDetail = async ({
	id,
	user,
}: {
	id: string;
	user: UpdateUserDetail["json"];
}) => {
	const response = await adminClient.admin.users[":id"].$put({
		param: {
			id: id.toString(),
		},
		json: user,
	});

	return handleResponse(response);
};
