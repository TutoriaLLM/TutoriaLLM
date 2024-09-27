import type { Guide } from "../server/db/schema.js";

function stringifyKnowledge(knowledge: Guide[] | string) {
	if (typeof knowledge === "string") {
		return knowledge;
	}
	try {
		return JSON.stringify((knowledge as Guide[]).map((k) => k.answer));
	} catch (e) {
		console.error(e);
		return "Failed to stringify knowledge.";
	}
}

export default stringifyKnowledge;
