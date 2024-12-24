import {
	adminClient,
	anonymousClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
	baseURL: `${VITE_BACKEND_URL}/auth`,

	plugins: [adminClient(), anonymousClient(), usernameClient()],
});
