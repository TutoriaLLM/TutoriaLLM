import { client, handleResponse } from "@/api";
export const getConfig = async () => {
	const response = await client.config.$get();
	return await handleResponse(response);
};
