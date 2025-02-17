import { expect, test } from "@playwright/test";

test("start as guest", async ({ page }) => {
	await page.goto("http://localhost:3000/login?redirect=%2F");
	await page.getByRole("combobox").selectOption("en");
	await page.getByRole("button", { name: "Continue as Guest" }).click();

	await page.waitForURL("/");

	const cookies = await page.context().cookies();
	const sessionTokenCookie = cookies.find(
		(cookie) => cookie.name === "better-auth.session_token",
	);
	expect(sessionTokenCookie).toBeDefined();
});

test("delete-account", async ({ page }) => {
	await page.goto("http://localhost:3000/login?redirect=%2F");
	await page.getByRole("combobox").selectOption("en");
	await page.getByRole("button", { name: "Continue as Guest" }).click();

	await page.getByRole("button", { name: "Delete account" }).click();

	await page.waitForURL("/login");

	const cookies = await page.context().cookies();
	const sessionTokenCookie = cookies.find(
		(cookie) => cookie.name === "better-auth.session_token",
	);

	expect(sessionTokenCookie).toBeUndefined();
});

test("upgrading guest to user", async ({ page }) => {
	await page.goto("http://localhost:3000/login?redirect=%2F");
	await page.getByRole("combobox").selectOption("en");
	await page.getByRole("button", { name: "Continue as Guest" }).click();
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.getByLabel("Display name").fill("Test User");
	await page.getByLabel("Display name").press("Tab");
	const randomnumber = Math.floor(Math.random() * 1000000);
	await page.getByLabel("Username").fill(`testuser-${randomnumber}`);
	await page.getByLabel("Username").press("Tab");
	await page.getByLabel("Email").fill(`testuser-${randomnumber}@example.com`);
	await page.getByLabel("Email").press("Tab");
	await page.getByLabel("Password", { exact: true }).fill("TestUser");
	await page.getByLabel("Password", { exact: true }).press("Tab");
	await page.getByLabel("Confirm password").fill("TestUser");
	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Create account" })
		.click();
	await page.waitForSelector('[role="dialog"]', { state: "hidden" });

	const cookies = await page.context().cookies();
	const sessionTokenCookie = cookies.find(
		(cookie) => cookie.name === "better-auth.session_token",
	);

	expect(sessionTokenCookie).toBeDefined();
	const usernameRegex = new RegExp(`testuser-${randomnumber}`);
	await expect(page.getByText(usernameRegex).first()).toBeVisible();
});
