import type { InferRequestType } from "backend/hc";
import { client, handleResponse } from ".";

export const createSession = async ({ language }: { language: string }) => {
	const response = await client.session.new.$post({
		query: {
			language,
		},
	});

	return handleResponse(response);
};

const SessionToResume = client.session.resume[":key"].$post;
type SessionToResume = InferRequestType<typeof SessionToResume>;
export const resumeSession = async (key: SessionToResume["param"]) => {
	const response = await client.session.resume[":key"].$post({
		param: key,
	});

	return handleResponse(response);
};

const SessionIdToGet = client.session[":key"].$get;
type SessionIdToGet = InferRequestType<typeof SessionIdToGet>;
export const getSession = async (key: SessionIdToGet["param"]) => {
	const response = await client.session[":key"].$get({
		param: key,
	});

	return handleResponse(response);
};

const SessionToPut = client.session[":key"].$put;
type SessionToPut = InferRequestType<typeof SessionToPut>;
export const updateSession = async (
	key: SessionToPut["param"],
	session: SessionToPut["json"],
) => {
	const response = await client.session[":key"].$put({
		param: key,
		json: session,
	});
	return handleResponse(response);
};

const SessionToDelete = client.session[":key"].$delete;
type SessionToDelete = InferRequestType<typeof SessionToDelete>;
export const deleteSession = async (key: SessionToDelete["param"]) => {
	const response = await client.session[":key"].$delete({
		param: key,
	});
	return handleResponse(response);
};
