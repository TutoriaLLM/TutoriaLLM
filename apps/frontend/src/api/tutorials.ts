import type { InferRequestType } from "backend/hc";
import { client, handleResponse } from ".";

export const getTutorialList = async () => {
	const response = await client.tutorials.$get();

	return handleResponse(response);
};

const TutorialIdToGet = client.tutorials[":id"].$get;
type TutorialIdToGet = InferRequestType<typeof TutorialIdToGet>;
export const getTutorial = async (id: TutorialIdToGet["param"]) => {
	const response = await client.tutorials[":id"].$get({
		param: id,
	});

	return handleResponse(response);
};

export const getTagList = async () => {
	const response = await client.tutorials.tags.$get();

	return handleResponse(response);
};
