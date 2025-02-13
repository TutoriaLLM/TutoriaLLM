import { session, user } from "@/db/schema";
import { vi, afterAll, afterEach } from "vitest";

export async function setup() {
	const { container, db, truncate, down } = await vi.hoisted(async () => {
		const { setupDB } = await import("./db.setup");

		return await setupDB({ port: "random" });
	});

	const mock = vi.hoisted(() => ({
		session: vi.fn(),
	}));

	vi.mock("@/libs/auth", async () => {
		type actual = typeof import("@/libs/auth");
		const actual = (await vi.importActual("@/libs/auth")) as actual;
		return {
			...actual,
			auth: {
				...actual.auth,
				api: {
					...actual.auth.api,
					getSession: mock.session,
				},
			},
		};
	});

	vi.mock("@/db", () => ({
		db,
	}));

	afterAll(async () => {
		await down();
	});

	afterEach(async () => {
		await truncate();
	});

	async function createUser({ userStr }: { userStr?: string } = {}) {
		const result = await db.transaction(async (tx) => {
			const dummyUser = await tx
				.insert(user)
				.values({
					id: userStr || "testUser123",
					name: `${userStr || "testUser123"}-name`,
					email: `${userStr || "testUser123"}@example.com`,
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					role: "user",
					banned: false,
					banReason: null,
					banExpires: null,
					username: `${userStr || "testUser123"}-username`,
					isAnonymous: false,
				})
				.returning();
			const dummySession = await tx
				.insert(session)
				.values({
					id: `session-${dummyUser[0].id}`,
					createdAt: new Date(),
					updatedAt: new Date(),
					userId: dummyUser[0].id,
					expiresAt: new Date(Date.now() + 1000 * 60 * 60),
					token: `mock-token-${dummyUser[0].id}`,
					ipAddress: "127.0.0.1",
					userAgent: "Mozilla/5.0",
					impersonatedBy: null,
				})
				.returning();
			return {
				session: dummySession[0],
				user: dummyUser[0],
			};
		});
		mock.session.mockResolvedValue(result);
	}
	return {
		container,
		db,
		truncate,
		down,
		createUser,
	};
}
