import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, waitFor, cleanup } from "@testing-library/react";

// テスト対象のコンポーネントをインポート
import { ExecSwitch } from "./ExecSwitch";
import { getSocket } from "@/libs/socket";
// react-i18nextのモック（翻訳用）
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (str: string) => str, // 実際の翻訳ではなく文字列を返すだけのモック
	}),
}));

describe("Test for ExecSwitch", () => {
	const mockSocket = getSocket("test");
	mockSocket.emit = vi.fn();

	afterEach(() => {
		cleanup();
	});

	it("Is code can be stopped when code is running", async () => {
		const result = render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);
		const switchElement = result.getByRole("switch");

		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
			expect(switchElement).toBeChecked();
		});

		fireEvent.click(switchElement);

		expect(mockSocket.emit).toHaveBeenCalledWith("stopVM");
	});

	it("Is switch can be clicked when code is not running, with workspace value", async () => {
		const result = render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={false}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);
		const switchElement = result.getByRole("switch");

		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
			expect(switchElement).not.toBeChecked();
		});

		fireEvent.click(switchElement);

		expect(mockSocket.emit).toHaveBeenCalledWith("openVM");
	});

	it("Is switch can't be clicked when its reloading", async () => {
		const result = render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);
		const buttonElement = result.getByRole("button");

		await waitFor(() => {
			expect(buttonElement).not.toBeDisabled();
		});

		fireEvent.click(buttonElement);

		expect(buttonElement).toBeDisabled();
	});

	it("Don't show switch when not connected", () => {
		const result = render(
			<ExecSwitch
				socket={null}
				isCodeRunning={false}
				isConnected={false}
				workspace={null}
			/>,
		);

		expect(result.container.querySelector(".execSwitch")).toBeEmptyDOMElement();
	});
});
