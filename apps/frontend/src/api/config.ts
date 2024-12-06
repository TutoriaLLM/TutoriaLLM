import { client, handleResponse } from "./index.js";
export const getConfig = async () => {
	const response = await client.config.$get();
	return await handleResponse(response);
};
