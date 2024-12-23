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

const SessionToDelete = adminClient.admin.session[":uuid"].$delete;
type SessionToDelete = InferRequestType<typeof SessionToDelete>;
export const deleteSession = async (uuid: SessionToDelete["param"]) => {
	const response = await adminClient.admin.session[":uuid"].$delete({
		param: uuid,
	});
	return handleResponse(response);
};
