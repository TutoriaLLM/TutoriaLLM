import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { createHtmlReport } from "axe-html-reporter";

// Test the accessibility of the page
test("accessibility test", async ({ page }) => {
	await page.goto("http://localhost:3000");

	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]) // Specify the tags to include in the analysis
		.analyze();

	if (results.violations.length > 0) {
		createHtmlReport({ results });
	}

	expect(results.violations.length).toBe(0);
});
