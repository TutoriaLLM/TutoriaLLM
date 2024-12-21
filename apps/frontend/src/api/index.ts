import { type ClientResponse, adminHcWithType, hcWithType } from "backend/hc";

type ApiErrorType =
	| "BAD_REQUEST"
	| "VALIDATION_ERROR"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "SERVER_ERROR"
	| "TOO_MANY_REQUESTS";

interface ApiErrorResponse {
	message: string;
	type: ApiErrorType;
	status: 400 | 401 | 403 | 404 | 429 | 500;
}

export class ApiError extends Error {
	type: ApiErrorType;
	status: number;

	constructor(response: ApiErrorResponse) {
		super(response.message);
		this.type = response.type;
		this.status = response.status;
		this.name = "ApiError";
	}
}

export const client = hcWithType(
	import.meta.env.VITE_PUBLIC_BACKEND_URL as string,
	{
		headers: {
			Origin: import.meta.env.VITE_PUBLIC_FRONTEND_URL as string,
			Host: new URL(import.meta.env.VITE_PUBLIC_BACKEND_URL as string).host,
			"Content-Type": "application/json",
		},
		fetch: (input: RequestInfo | URL, requestInit?: RequestInit) =>
			fetch(input, {
				...requestInit,
				credentials: "include",
			}),
	},
);
export const adminClient = adminHcWithType(
	import.meta.env.VITE_PUBLIC_BACKEND_URL as string,
	{
		headers: {
			Origin: import.meta.env.VITE_PUBLIC_FRONTEND_URL as string,
			Host: new URL(import.meta.env.VITE_PUBLIC_BACKEND_URL as string).host,
			"Content-Type": "application/json",
		},
		fetch: (input: RequestInfo | URL, requestInit?: RequestInit) =>
			fetch(input, {
				...requestInit,
				credentials: "include",
			}),
	},
);

export const handleResponse = async <
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	T extends Record<string, any>,
	U extends ClientResponse<T, number, "json">,
>(
	response: U,
) => {
	const json = await response.json();

	if (response.ok) {
		return json as Awaited<ReturnType<Extract<U, { status: 200 }>["json"]>>;
	}

	if ("error" in json) throw new ApiError(json.error);
	throw new Error("Unknown error");
};
