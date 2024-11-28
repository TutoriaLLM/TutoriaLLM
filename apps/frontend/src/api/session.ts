import { client, handleResponse } from ".";

export const createSession = async ({ language }: { language: string }) => {
	const response = await client.session.new.$post({
		query: {
			language,
		},
	});

	return response.text();
};
