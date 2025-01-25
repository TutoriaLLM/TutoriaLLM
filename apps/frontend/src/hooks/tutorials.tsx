import { getTagList } from "@/api/tutorials";
import { useQuery } from "@tanstack/react-query";

export const useListTags = () => {
	const {
		data: tags,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTagList(),
		retry: false,
		staleTime: 1000 * 60 * 1, // 1 minute of cache
		refetchOnReconnect: true,
	});
	return { tags, isPending, isError };
};
