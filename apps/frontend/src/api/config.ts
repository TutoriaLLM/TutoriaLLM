import { client, handleResponse } from "./index.js";
export const getConfig = async () => {
	const response = await client.api.config.$get();
	return await handleResponse(response);
};
