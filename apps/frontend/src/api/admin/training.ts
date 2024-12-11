import type { InferRequestType } from "backend/hc";
import { adminClient, handleResponse } from "..";

export const getRandomTrainingData = async () => {
	const response = await adminClient.admin.training.data.random.$get();
	return handleResponse(response);
};

export const getTrainingDataList = async () => {
	const response = await adminClient.admin.training.data.list.$get();
	return handleResponse(response);
};

const DataToDelete = adminClient.admin.training.data[":id"].$delete;
type DataToDelete = InferRequestType<typeof DataToDelete>;
export const deleteTrainingData = async (id: DataToDelete["param"]) => {
	const response = await adminClient.admin.training.data[":id"].$delete({
		param: id,
	});
	return handleResponse(response);
};

//Guide

const GuideToCreate = adminClient.admin.training.guide.new.$post;
type GuideToCreate = InferRequestType<typeof GuideToCreate>;
export const createNewGuide = async (guide: GuideToCreate["json"]) => {
	const response = await adminClient.admin.training.guide.new.$post({
		json: guide,
	});
	return handleResponse(response);
};

const SearchGuides = adminClient.admin.training.guide.search.$post;
type SearchGuides = InferRequestType<typeof SearchGuides>;
export const searchGuides = async (searchQuery: SearchGuides["query"]) => {
	const response = await adminClient.admin.training.guide.search.$post({
		query: searchQuery,
	});
	return handleResponse(response);
};

export const listGuides = async () => {
	const response = await adminClient.admin.training.guide.list.$get();
	return handleResponse(response);
};

const GetGuide = adminClient.admin.training.guide[":id"].$get;
type GetGuide = InferRequestType<typeof GetGuide>;
export const getGuide = async (id: GetGuide["param"]) => {
	const response = await adminClient.admin.training.guide[":id"].$get({
		param: id,
	});
	return handleResponse(response);
};

const GuideToUpdate = adminClient.admin.training.guide[":id"].$put;
type GuideToUpdate = InferRequestType<typeof GuideToUpdate>;
export const updateGuide = async (
	id: GuideToUpdate["param"],
	guide: GuideToUpdate["json"],
) => {
	const response = await adminClient.admin.training.guide[":id"].$put({
		param: id,
		json: guide,
	});
	return handleResponse(response);
};

const GuideToDelete = adminClient.admin.training.guide[":id"].$delete;
type GuideToDelete = InferRequestType<typeof GuideToDelete>;
export const deleteGuide = async (id: GuideToDelete["param"]) => {
	const response = await adminClient.admin.training.guide[":id"].$delete({
		param: id,
	});
	return handleResponse(response);
};
