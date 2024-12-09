import type { SessionValue, Stats } from "@/modules/session/schema";

export function updateStats(
	statsToUpdate: Partial<Stats>,
	jsonToUpdate: SessionValue,
): SessionValue {
	console.log(`updateStats: ${statsToUpdate}`);
	return {
		...jsonToUpdate,
		stats: {
			...jsonToUpdate.stats,
			...statsToUpdate,
		} as Stats,
	};
}
