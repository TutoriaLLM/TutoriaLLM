import { getTutorials } from "@/api/admin/tutorials";
import { useQuery } from "@tanstack/react-query";

export const useListTutorials = () => {
	const {
		data: tutorials,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["tutorials"],
		queryFn: () => getTutorials(),
		retry: false,
		staleTime: 1000 * 60 * 1, // 1 minute of cache
		refetchOnReconnect: true,
	});
	return { tutorials, isPending, isError };
};
