import { listSessions } from "@/api/admin/session";
import type { SessionValue } from "@/type";
import { useQuery } from "@tanstack/react-query";
// get Session lists for admin, with pagination
export type Pagination = {
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
