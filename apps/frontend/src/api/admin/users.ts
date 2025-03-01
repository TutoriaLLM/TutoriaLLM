import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";
import { authClient } from "@/libs/auth-client";
import type { userQuerySchema } from "@/routes/admin/users";
import type { z } from "zod";

//better-auth API
export const getUserList = async (query: z.infer<typeof userQuerySchema>) => {
	const {
		limit,
		page,
		sortField,
		sortOrder,
		searchField,
		searchOperator,
		searchValue,
		role,
	} = query;
	const userQuery: Record<string, any> = {
		limit: limit,
		offset: (page - 1) * limit,
		sortBy: sortField,
		sortDirection: sortOrder,
	};

	if (searchField) userQuery.searchField = searchField;
	if (searchOperator) userQuery.searchOperator = searchOperator;
	if (searchValue) userQuery.searchValue = searchValue;
	if (role) {
		userQuery.filterField = "role";
		userQuery.filterValue = role;
		userQuery.filterOperator = "eq";
	}

	return await authClient.admin.listUsers({
		fetchOptions: {},
		query: userQuery,
	});
};

// manual API
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
