import { session, user } from "@/db/schema";
import { vi, afterAll, afterEach } from "vitest";

const testUser = {
	email: "test-email@email.com",
	name: "Test Name",
};

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

	async function createUser() {
		console.info("Creating user");
		const result = await db.transaction(async (tx) => {
			const dummyUser = await tx
				.insert(user)
				.values({
					id: "user-id-123",
					name: testUser.name,
					email: testUser.email,
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					role: "user",
					banned: false,
					banReason: null,
					banExpires: null,
					username: "mockuser",
					isAnonymous: false,
				})
				.returning();
			const dummySession = await tx
				.insert(session)
				.values({
					id: "session-id-123",
					createdAt: new Date(),
					updatedAt: new Date(),
					userId: dummyUser[0].id,
					expiresAt: new Date(Date.now() + 1000 * 60 * 60),
					token: "mock-session-token",
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
