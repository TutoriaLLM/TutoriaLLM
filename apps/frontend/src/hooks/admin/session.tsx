import { listSessions, listSessionsFromUserId } from "@/api/admin/session";
import type { SessionValue } from "@/type";
import { useQuery } from "@tanstack/react-query";

// get Session lists for admin, with pagination
type Pagination = {
	page: number;
	limit: number;
	sortField: keyof SessionValue;
	sortOrder: string;
};

export const useListSessions = (
	pagination: Pagination,
	refetchInterval?: number | false,
) => {
	const {
		data: sessions,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["sessions", pagination],
		queryFn: () =>
			listSessions({
				...pagination,
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
			}),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
		refetchInterval,
	});
	return { sessions, isPending, isError };
};

export const useListSessionsFromUserId = (
	pagination: Pagination,
	userId: string,
) => {
	const {
		data: userSessions,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["sessions", pagination, userId],
		queryFn: () =>
			listSessionsFromUserId(
				{
					...pagination,
					page: pagination.page.toString(),
					limit: pagination.limit.toString(),
				},
				userId,
			),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
	});
	return { userSessions, isPending, isError };
};
