import * as Blockly from "blockly/core";

/**
 * Convert an SVG of a block to a PNG data URI.
 * @param {Blockly.WorkspaceSvg} workspace The workspace.
 * @returns {Promise<string>} A promise that resolves with the data URI.
 */
export async function workspaceToPngBase64(
	workspace: Blockly.WorkspaceSvg,
): Promise<string> {
	try {
		// Calculate block dimensions and create an SVG element.
		const bBox = workspace.getBlocksBoundingBox();
		console.log("bBox", bBox);
		const padding = 10; // 適切なパディング値を設定
		const x = bBox.left - padding;
		const y = bBox.top - padding;
		const width = bBox.right - bBox.left + padding * 2;
		const height = bBox.bottom - bBox.top + padding * 2;
		const blockCanvas = workspace.getCanvas();

		const clone = blockCanvas.cloneNode(true) as SVGSVGElement;
		console.log("clone", clone);
		clone.removeAttribute("transform");
		Blockly.utils.dom.removeClass(clone, "blocklySelected");

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		console.log("svg", svg);
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.appendChild(clone);
		svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
		svg.setAttribute("width", width.toString());
		svg.setAttribute("height", height.toString());

		// Include styles from specific style tag and Blockly's styles
		const zerosClassicStyle = document.getElementById(
			"blockly-renderer-style-zeros-classic",
		) as HTMLStyleElement;
		const blocklySvgStyle = Array.from(
			document.head.querySelectorAll("style"),
		).find((el) =>
			/\.blocklySvg/.test(el.textContent || ""),
		) as HTMLStyleElement;

		const style = document.createElement("style");
		style.textContent = `${zerosClassicStyle?.textContent || ""}\n${
			blocklySvgStyle?.textContent || ""
		}`;
		svg.insertBefore(style, svg.firstChild);

		// Serialize SVG and convert to PNG.
		let svgAsXML = new XMLSerializer().serializeToString(svg);
		svgAsXML = svgAsXML.replace(/&nbsp/g, "&#160");
		const data = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`;
		console.log(data);

		// Convert SVG to PNG.
		return new Promise<string>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const pixeldensity = window.devicePixelRatio || 1;
				canvas.width = width * pixeldensity;
				canvas.height = height * pixeldensity;
				const context = canvas.getContext("2d");
				if (context) {
					context.drawImage(img, 0, 0, canvas.width, canvas.height);
					const dataUri = canvas.toDataURL("image/png");

					// Use canvas and then remove it
					canvas.remove(); // <- ここでcanvasを削除

					resolve(dataUri);
				} else {
					reject(new Error("Failed to get canvas context"));
				}
			};
			img.onerror = reject;
			img.src = data;
		});
	} catch (error) {
		console.error("Error in blockToPng:", error);
		throw error;
	}
}
