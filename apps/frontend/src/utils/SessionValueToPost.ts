import type { SessionValue, SessionValuePost } from "@/type";

//SessionValueをPostに変換
export function SessionValueToPost(session: SessionValue): SessionValuePost {
	return {
		...session,
		createdAt: new Date(session.createdAt),
		updatedAt: new Date(session.updatedAt),
	};
}
