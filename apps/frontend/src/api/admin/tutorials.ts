import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";

export const getTutorials = async () => {
	const response = await adminClient.admin.tutorials.$get();

	return handleResponse(response);
};

export const getSpecificTutorial = async ({ id }: { id: number }) => {
	const response = await adminClient.admin.tutorials[":id"].$get({
		param: {
			id,
		},
	});

	return handleResponse(response);
};

export const deleteTutorial = async ({
	id,
}: {
	id: number;
}) => {
	const response = await adminClient.admin.tutorials[":id"].$delete({
		param: {
			id,
		},
	});

	return handleResponse(response);
};

const TutorialToCreate = adminClient.admin.tutorials.$post;
type TutorialToCreate = InferRequestType<typeof TutorialToCreate>;
export const createTutorial = async (tutorial: TutorialToCreate["json"]) => {
	const response = await adminClient.admin.tutorials.$post({
		json: tutorial,
	});
	return handleResponse(response);
};

const TutorialToUpdate = adminClient.admin.tutorials[":id"].$put;
type TutorialToUpdate = InferRequestType<typeof TutorialToUpdate>;
export const updateTutorial = async ({
	id,
	tutorial,
}: {
	id: number;
	tutorial: TutorialToUpdate["json"];
}) => {
	const response = await TutorialToUpdate({
		param: {
			id,
		},
		json: tutorial,
	});
	return handleResponse(response);
};
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
