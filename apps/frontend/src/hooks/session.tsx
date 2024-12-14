import { getSession } from "@/api/session";
import type { SessionValue } from "@/type";
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

export const useSession = (code: string, refetchInterval?: number | false) => {
	const {
		data: session,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["session", code],
		queryFn: () => getSession({ key: code }),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
		refetchInterval,
	});
	return { session, isPending, isError };
};
