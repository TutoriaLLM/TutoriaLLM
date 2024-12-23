import { getSession } from "@/api/session";
import { useQuery } from "@tanstack/react-query";

// export const getAndSetSession = async (
// 	setSession: (session: SessionValue | null) => void,
// 	code: string,
// ) => {
// 	try {
// 		const session = await getSession({ key: code });
// 		setSession(session);
// 		return session;
// 	} catch {
// 		setSession(null);
// 		return null;
// 	}
// };

export const useSession = (uuid: string, refetchInterval?: number | false) => {
	const {
		data: session,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["session", uuid],
		queryFn: () => getSession({ key: uuid }),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
		refetchInterval,
	});
	return { session, isPending, isError };
};
