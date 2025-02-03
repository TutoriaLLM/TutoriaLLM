import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

// テスト対象のコンポーネントをインポート
import { ExecSwitch } from "./ExecSwitch";
import { renderFC } from "@/libs/test";

// react-i18nextのモック（翻訳用）
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (str: string) => str, // 実際の翻訳ではなく文字列を返すだけのモック
	}),
}));

describe("ExecSwitch コンポーネントのテスト", () => {
	let mockSocket: any;

	beforeEach(() => {
		mockSocket = {
			emit: vi.fn(),
		};
	});

	it("Is code can be stopped when code is running", async () => {
		const result = renderFC(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);
		const switchElement = result.getByTestId("exec-switch");

		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
		});

		fireEvent.click(switchElement);

		expect(mockSocket.emit).toHaveBeenCalledWith("stopVM");
	});

	it("Is switch can be clicked when code is not running", async () => {
		const result = renderFC(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={false}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);
		const switchElement = result.getByTestId("exec-switch");

		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
		});

		fireEvent.click(switchElement);

		expect(mockSocket.emit).toHaveBeenCalledWith("openVM");
	});

	it("Don't show switch when not connected", () => {
		const result = renderFC(
			<ExecSwitch
				socket={null}
				isCodeRunning={false}
				isConnected={false}
				workspace={null}
			/>,
		);

		expect(result.container.querySelector(".execSwitch")).toBeEmptyDOMElement();
	});

	it("Is updates code button working", async () => {
		const result = renderFC(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);

		const reloadButton = result.getByTestId("update-code");

		await waitFor(() => {
			expect(reloadButton).not.toBeDisabled();
		});

		fireEvent.click(reloadButton);

		await waitFor(() => {
			expect(mockSocket.emit);
		});
		expect(reloadButton).toBeDisabled();
	});
});
