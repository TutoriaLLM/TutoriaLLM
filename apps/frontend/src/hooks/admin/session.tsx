import { useQuery } from "@tanstack/react-query";
import { listSessions } from "@/api/admin/session";
import type { SessionValue } from "@/type";

// get Session lists for admin, with pagination
export type Pagination = {
	page: number;
	pageSize: number;
	sortField: keyof SessionValue;
	sortOrder: string;
};
export const useListSessions = (
	pagination: Pagination,
	setLoading?: (loading: boolean) => void,
	refetchInterval?: number | false,
) => {
	const {
		data: sessions,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["sessions", pagination],
		queryFn: () =>
			listSessions(pagination).then((res) => {
				console.log(refetchInterval, "refetchInterval");
				setLoading?.(false);
				return res;
			}),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
		refetchInterval,
	});
	return { sessions, isPending, isError };
};
