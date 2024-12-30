import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";

export const downloadAllSessions = async () => {
	const response = await adminClient.admin.session.download.$get();
	return handleResponse(response);
};

export const listSessions = async (
	query: InferRequestType<typeof adminClient.admin.session.list.$get>["query"],
) => {
	const response = await adminClient.admin.session.list.$get({
		query,
	});
	return handleResponse(response);
};

const listSessionsFromUserIdType =
	adminClient.admin.session.find[":userId"].$get;
type listSessionsFromUserIdType = InferRequestType<
	typeof listSessionsFromUserIdType
>;
export const listSessionsFromUserId = async (
	query: listSessionsFromUserIdType["query"],
	userId: string,
) => {
	const response = await adminClient.admin.session.find[":userId"].$get({
		query,
		param: {
			userId,
		},
	});
	return handleResponse(response);
};

const SessionToDelete = adminClient.admin.session[":sessionId"].$delete;
type SessionToDelete = InferRequestType<typeof SessionToDelete>;
export const deleteSession = async (sessionId: SessionToDelete["param"]) => {
	const response = await adminClient.admin.session[":sessionId"].$delete({
		param: sessionId,
	});
	return handleResponse(response);
};
