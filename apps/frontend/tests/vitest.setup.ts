import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "@/mocks/setup";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

vi.stubGlobal("VITE_BACKEND_URL", "https://localhost:3001");

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
