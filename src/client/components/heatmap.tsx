import { useEffect, useRef, useState } from "react";
import type { Click } from "../../type.js";

function Heatmap({
	clicks,
	className,
	width,
	height,
}: {
	clicks: Click[];
	className?: string;
	width: number;
	height: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [canvasSize, setCanvasSize] = useState({ width, height });

	useEffect(() => {
		const updateCanvasSize = () => {
			if (canvasRef.current) {
				const { width, height } = canvasRef.current.getBoundingClientRect();
				setCanvasSize({ width, height });
			}
		};

		updateCanvasSize();
		window.addEventListener("resize", updateCanvasSize);
		return () => window.removeEventListener("resize", updateCanvasSize);
	}, []);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			// Set canvas size
			canvas.width = canvasSize.width;
			canvas.height = canvasSize.height;

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw heatmap
			for (const click of clicks) {
				drawHeatPoint(ctx, click.x, click.y, click.value);
			}
		}
	}, [clicks, canvasSize]);

	const drawHeatPoint = (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		value: number,
	) => {
		const radius = Math.min(canvasSize.width, canvasSize.height) * 0.05; // Relative radius
		const normalizedValue = Math.min(Math.max(value, 0), 1); // Ensure value is between 0 and 1
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
		gradient.addColorStop(0, `rgba(255, 0, 0, ${normalizedValue})`);
		gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		ctx.fillStyle = gradient;
		ctx.fill();
	};

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={{ width: `${width}px`, height: `${height}px` }}
		/>
	);
}

export default Heatmap;
