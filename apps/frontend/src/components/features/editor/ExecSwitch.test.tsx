import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// テスト対象のコンポーネントをインポート
import { ExecSwitch } from "./ExecSwitch";

// react-i18nextのモック（翻訳用）
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (str: string) => str, // 実際の翻訳ではなく文字列を返すだけのモック
	}),
}));

describe("ExecSwitch コンポーネントのテスト", () => {
	let mockSocket: any;

	beforeEach(() => {
		// socketのemitが呼ばれたか検証するためのモック
		mockSocket = {
			emit: vi.fn(),
		};
	});

	it("接続状態で実行中コードをSTOPできるか", async () => {
		// isCodeRunning=true かつ isConnected=trueでコンポーネントをレンダリング
		render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);

		// 「停止」状態にするためにスイッチをクリック
		// Radix UIのSwitch.RootやSwitch.Thumbを使う場合、テストIDなどで取得すると良いです
		// ここではざっくりgetByRoleでラジオボタン扱いの例。実際はclassNameやroleに合わせて調整してください
		const switchElement = screen.getByRole("switch");

		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
		});

		// スイッチをクリック => STOP処理が走る
		fireEvent.click(switchElement);

		// 「stopVM」がemitされているか確認
		expect(mockSocket.emit).toHaveBeenCalledWith("stopVM");
	});

	it("接続状態で実行をSTARTできるか", async () => {
		// isCodeRunning=false かつ isConnected=trueでレンダリング
		render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={false}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);

		const switchElement = screen.getByRole("switch");

		// スイッチがdisableから戻るのを待つ（sleepの影響を考慮）
		await waitFor(() => {
			expect(switchElement).not.toBeDisabled();
		});

		// スイッチをクリック => openVM がemitされる想定
		fireEvent.click(switchElement);

		expect(mockSocket.emit).toHaveBeenCalledWith("openVM");
	});

	it("接続が無い場合（isConnected=false）は何も表示しない（もしくは操作できない）か", () => {
		const { container } = render(
			<ExecSwitch
				socket={null}
				isCodeRunning={false}
				isConnected={false}
				workspace={null}
			/>,
		);

		// 接続が無いとき、そもそもスイッチが表示されない例
		// → return nullしているのでコンテナ内に何も無いはず
		//   あるいはUIコンポーネントが無効化されている等をテスト
		expect(container.querySelector(".execSwitch")).toBeEmptyDOMElement();
	});

	it("updateCode（リロードボタン）が正しくemitを呼ぶか", async () => {
		render(
			<ExecSwitch
				socket={mockSocket}
				isCodeRunning={true}
				isConnected={true}
				workspace={{ foo: "bar" }}
			/>,
		);

		// リロードボタンを取得
		// Buttonのaria-labelかtext等に合わせてテストで取得します
		const reloadButton = screen.getByRole("button", { name: "navbar.reload" });

		// 有効になるまで待機
		// 状況によって「disabled状態が外れる」まで少し待つ必要がある
		await waitFor(() => {
			expect(reloadButton).not.toBeDisabled();
		});

		fireEvent.click(reloadButton);

		// すぐにsocket.emit("updateVM")が呼ばれるわけではなく1秒待機
		// → setTimeout(() => { socket.emit(...)} )が実行される流れがある
		// テストではFake Timersを使う、またはwaitForで待つ方法があります

		// 例: waitForでmockSocket.emitの呼び出しを待つ
		await waitFor(() => {
			expect(mockSocket.emit).toHaveBeenCalledWith(
				"updateVM",
				expect.any(Function),
			);
		});

		// emit時にコールバックが渡されているので、コールバック呼び出しをシミュレート
		// モックに格納されたコールバック関数を取り出し実行
		const callback = mockSocket.emit.mock.calls[0][1];
		callback("ok"); // 正常応答の場合

		// "ok" だったらボタンが無効化されたりする検証をここで行う
		expect(reloadButton).toBeDisabled();
	});
});
