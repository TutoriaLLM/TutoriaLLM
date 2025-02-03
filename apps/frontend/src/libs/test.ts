import { render, type RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";

//lib for testing components
export const renderFC = (ui: ReactNode, options: RenderOptions = {}) => {
	return render(ui, {
		container: document.body.appendChild(document.createElement("div")),
		...options,
	});
};
