import { client, handleResponse } from ".";

export const getTutorialList = async () => {
	const response = await client.tutorials.$get();

	return handleResponse(response);
};

export const getTagList = async () => {
	const response = await client.tutorials.tags.$get();

	return handleResponse(response);
};
