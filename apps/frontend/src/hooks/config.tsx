import { getConfig } from "@/api/config";
import { useQuery } from "@tanstack/react-query";

export const useConfig = () => {
	const {
		data: config,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["config"],
		queryFn: getConfig,
		staleTime: 1000 * 60 * 3, // 3 minutes
		refetchOnReconnect: true,
	});
	return { config, isLoading, isError };
};
