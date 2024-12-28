import { getUserDetail } from "@/api/admin/users";
import { useQuery } from "@tanstack/react-query";

export const useUserDetail = (id: string) => {
	const {
		data: userDetail,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["userInfo", id],
		queryFn: () => getUserDetail({ id }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnReconnect: true,
	});
	return { userDetail, isPending, isError };
};
