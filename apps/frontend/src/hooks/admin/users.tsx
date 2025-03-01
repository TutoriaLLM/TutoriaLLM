import { getUserList } from "@/api/admin/users";
import type { userQuerySchema } from "@/routes/admin/users";
import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

export const useUserList = (search: z.infer<typeof userQuerySchema>) => {
	const {
		data: users,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["users", search],
		queryFn: () =>
			getUserList({
				...search,
			}),
		staleTime: 1000 * 60 * 1, // 1 minute of cache
		refetchOnReconnect: true,
	});
	return { users, isPending, isError };
};
