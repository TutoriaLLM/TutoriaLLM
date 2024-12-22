import type React from "react";
import {
	type ReactNode,
	type RefObject,
	createContext,
	useContext,
	useEffect,
	useRef,
} from "react";

// Context Type Definition
interface HorizontalScrollContextType {
	scrollRef: RefObject<HTMLDivElement>;
}

// Define default value as null
const HorizontalScrollContext = createContext<
	HorizontalScrollContextType | undefined
>(undefined);

// Provider Component Type Definition
interface HorizontalScrollProviderProps {
	children: ReactNode;
}

// Provider Implementation
/* *
 * Provider component to convert vertical scrolling to horizontal scrolling
 * @example.
 * ``tsx
 * import { HorizontalScrollProvider, useHorizontalScroll } from '. /HorizontalScrollProvider'; // import provider
 * <HorizontalScrollProvider>
 * <div ref={scrollRef}>... Content</div>
 * </HorizontalScrollProvider>
 * ```
 */
export const HorizontalScrollProvider: React.FC<
	HorizontalScrollProviderProps
> = ({ children }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) return;

		const handleWheel = (e: WheelEvent) => {
			const maxScrollLeft =
				scrollElement.scrollWidth - scrollElement.clientWidth;

			// Do not process if the input is a horizontal scroll
			if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

			// Allow vertical scrolling if scrolling limits are reached
			if (
				(scrollElement.scrollLeft <= 0 && e.deltaY < 0) ||
				(scrollElement.scrollLeft >= maxScrollLeft && e.deltaY > 0)
			) {
				return;
			}

			// Convert vertical scrolling to horizontal scrolling
			e.preventDefault();
			scrollElement.scrollLeft += e.deltaY;
		};

		// Add event listeners
		scrollElement.addEventListener("wheel", handleWheel);

		// cleanup function
		return () => {
			scrollElement.removeEventListener("wheel", handleWheel);
		};
	}, []);

	return (
		<HorizontalScrollContext.Provider value={{ scrollRef }}>
			{children}
		</HorizontalScrollContext.Provider>
	);
};

// Use context in custom hooks
export const useHorizontalScroll = (): RefObject<HTMLDivElement> => {
	const context = useContext(HorizontalScrollContext);
	if (!context) {
		throw new Error(
			"useHorizontalScroll must be used within a HorizontalScrollProvider",
		);
	}
	return context.scrollRef;
};
