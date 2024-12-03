import { getSession } from "@/api/session";
import type { SessionValue } from "@/type";

export const getAndSetSession = async (
	setSession: (session: SessionValue | null) => void,
	code: string,
) => {
	try {
		const session = await getSession({ key: code });
		setSession(session);
		return session;
	} catch {
		setSession(null);
		return null;
	}
};
