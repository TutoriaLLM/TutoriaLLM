import { handleResponse, adminClient } from "..";

export const generateContent = async ({ content }: { content: string }) => {
	const response = await adminClient.admin.tutorials["generate-content"].$post({
		json: {
			content,
		},
	});

	return handleResponse(response);
};

export const generateMetadata = async ({ content }: { content: string }) => {
	const response = await adminClient.admin.tutorials["generate-metadata"].$post(
		{
			json: {
				content,
			},
		},
	);

	return handleResponse(response);
};
