import type { ApiError } from "@/api";
import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation as useBaseMutation,
} from "@tanstack/react-query";

export const useMutation = <
	TData = unknown,
	TError = ApiError,
	TVariables = void,
	TContext = unknown,
>(
	options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> =>
	useBaseMutation<TData, TError, TVariables, TContext>(options);
