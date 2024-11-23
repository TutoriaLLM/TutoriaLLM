import { type ClientResponse, hcWithType } from "backend/hc";

export const client = hcWithType(
	import.meta.env.VITE_PUBLIC_BACKEND_URL as string,
	{
		fetch: (input: RequestInfo | URL, requestInit?: RequestInit) =>
			fetch(input, {
				...requestInit,
				credentials: "include",
			}),
	},
);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const handleResponse = async <T extends Record<string, any>>(
	response: ClientResponse<T, number, "json">,
): Promise<T> => {
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message);
	}

	return data as T; // 必要であれば型アサーションを使う
};
