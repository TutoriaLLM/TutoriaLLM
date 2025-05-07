import { client, handleResponse } from ".";

export const uploadImage = async (data: File) => {
	// Create a FormData object with the file as the only entry
	const formData = new FormData();
	formData.append("file", data);
	// Use fetch directly with the correct credentials
	const response = await fetch(client.image.upload.$url(), {
		method: "POST",
		body: formData,
		// ヘッダーはフォームデータ送信時は指定しない
		credentials: "include",
	});
	const result = await response.json();
	if (!response.ok) throw new Error(result.message);
	return result;
};

export const deleteImage = async (fileName: string) => {
	const response = await client.image.delete.$delete({
		query: { fileName },
	});
	return handleResponse(response);
};

export const listImage = async (maxKeys: number) => {
	const response = await client.image.list.$get({
		query: {
			maxKeys,
		},
	});
	return handleResponse(response);
};
