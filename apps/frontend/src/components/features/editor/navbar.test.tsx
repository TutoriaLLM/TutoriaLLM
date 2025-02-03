import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import Navbar from "./navbar";
import { useTour } from "@reactour/tour";
import { renderFC } from "@/libs/test";
// Mock dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (str: string) => str,
	}),
}));

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({
		navigate: vi.fn(),
	}),
}));

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({
		invalidateQueries: vi.fn(),
	}),
	useMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("@reactour/tour", () => ({
	useTour: () => ({
		setIsOpen: vi.fn(),
	}),
}));

describe("Navbar Component Tests", () => {
	let mockSocket: any;

	beforeEach(() => {
		mockSocket = {
			disconnect: vi.fn(),
		};
	});

	it("renders correctly when connected", () => {
		const { getByText } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={mockSocket}
				isConnected={true}
				isTutorial={false}
				tutorialProgress={null}
			/>,
		);

		expect(getByText("navbar.saveAndLeave")).toBeInTheDocument();
		expect(getByText("Test Session")).toBeInTheDocument();
	});

	it("renders correctly when not connected", () => {
		const { getByText } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={null}
				isConnected={false}
				isTutorial={false}
				tutorialProgress={null}
			/>,
		);

		expect(getByText("navbar.reconnecting")).toBeInTheDocument();
	});

	it("exit button works correctly", () => {
		const { getByText } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={mockSocket}
				isConnected={true}
				isTutorial={false}
				tutorialProgress={null}
			/>,
		);

		const exitButton = getByText("navbar.saveAndLeave");
		fireEvent.click(exitButton);

		expect(mockSocket.disconnect).toHaveBeenCalled();
	});

	it("tutorial progress bar displays correctly", () => {
		const { getByText } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={mockSocket}
				isConnected={true}
				isTutorial={true}
				tutorialProgress={50}
			/>,
		);

		expect(getByText("50%")).toBeInTheDocument();
	});

	it("help button works correctly", () => {
		const { getByTestId } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={mockSocket}
				isConnected={true}
				isTutorial={false}
				tutorialProgress={null}
			/>,
		);

		const helpButton = getByTestId("start-tour");
		fireEvent.click(helpButton);

		expect(useTour().setIsOpen).toHaveBeenCalledWith(true);
	});

	it("ExecSwitch component renders correctly", () => {
		const { getByTestId } = renderFC(
			<Navbar
				sessionId="1"
				sessionName="Test Session"
				currentWorkspace={{ foo: "bar" }}
				isCodeRunning={false}
				socket={mockSocket}
				isConnected={true}
				isTutorial={false}
				tutorialProgress={null}
			/>,
		);

		expect(getByTestId("exec-switch")).toBeInTheDocument();
	});
});
