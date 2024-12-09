import { adminClient, handleResponse } from "..";
import type { InferResponseType } from "backend/hc";

export const updateConfig = async (
	config: InferResponseType<typeof adminClient.admin.config.update.$post>,
) => {
	const response = await adminClient.admin.config.update.$post({
		json: config,
	});

	return handleResponse(response);
};

export const getConfig = async () => {
	const response = await adminClient.admin.config.$get();
	return handleResponse(response);
};
