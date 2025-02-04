import { vi } from "vitest";

export async function setup() {
	const { container, db, truncate, down } = await vi.hoisted(async () => {
		const { setupDB } = await import("./db.setup");

		return await setupDB({ port: "random" });
	});

	vi.mock("@/db", () => ({
		db,
	}));

	return <const>{
		container,
		db,
		truncate,
		down,
	};
}
