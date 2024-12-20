// src/utils/time.test.ts
import { describe, expect, it } from "vitest";
import { timeAgo } from "@/utils/time";

describe("timeAgo", () => {
	it('should return "x seconds ago" for dates less than a minute ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
		expect(timeAgo(pastDate)).toBe("30 seconds ago");
	});

	it('should return "x minutes ago" for dates less than an hour ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
		expect(timeAgo(pastDate)).toBe("30 minutes ago");
	});

	it('should return "x hours ago" for dates less than a day ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
		expect(timeAgo(pastDate)).toBe("5 hours ago");
	});

	it('should return "x days ago" for dates less than a month ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
		expect(timeAgo(pastDate)).toBe("10 days ago");
	});

	it('should return "x months ago" for dates less than a year ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
		expect(timeAgo(pastDate)).toBe("3 months ago");
	});

	it('should return "x years ago" for dates more than a year ago', () => {
		const now = new Date();
		const pastDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
		expect(timeAgo(pastDate)).toBe("2 years ago");
	});
});
