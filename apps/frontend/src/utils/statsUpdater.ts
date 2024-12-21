import type { SessionValue, Stats } from "@/type";

export function updateStats(
	statsToUpdate: Partial<Stats>,
	jsonToUpdate: SessionValue,
): SessionValue {
	return {
		...jsonToUpdate,
		stats: {
			...jsonToUpdate.stats,
			...statsToUpdate,
		} as Stats,
	};
}
