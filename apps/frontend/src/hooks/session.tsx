import { getSession, getUserSessions } from "@/api/session";
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

export const useUserSession = () => {
	const {
		data: sessions,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["userSessions"],
		queryFn: () => getUserSessions(),
		staleTime: 0,
		refetchOnReconnect: true,
	});
	return { sessions, isPending, isError };
};

export const useSession = (
	sessionId: string,
	refetchInterval?: number | false,
) => {
	const {
		data: session,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["session", sessionId],
		queryFn: () => getSession({ key: sessionId }),
		staleTime: 1000 * 5, // 5 seconds of cache
		refetchOnReconnect: true,
		refetchInterval,
	});
	return { session, isPending, isError };
};
