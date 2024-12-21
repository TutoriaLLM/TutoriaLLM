import { client, handleResponse } from ".";

export const getStatus = async () => {
	const response = await client.status.$get();
	return handleResponse(response);
};
