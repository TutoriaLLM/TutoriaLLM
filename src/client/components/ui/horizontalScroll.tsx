import type React from "react";
import {
	createContext,
	useRef,
	useEffect,
	type ReactNode,
	type RefObject,
	useContext,
} from "react";

// コンテキストの型定義
interface HorizontalScrollContextType {
	scrollRef: RefObject<HTMLDivElement>;
}

// デフォルト値をnullで定義
const HorizontalScrollContext = createContext<
	HorizontalScrollContextType | undefined
>(undefined);

// プロバイダーコンポーネントの型定義
interface HorizontalScrollProviderProps {
	children: ReactNode;
}

// プロバイダーの実装
/**
 * 縦スクロールを横スクロールに変換するプロバイダーコンポーネント
 * @example
 * ```tsx
 * import { HorizontalScrollProvider, useHorizontalScroll } from './HorizontalScrollProvider'; // プロバイダーをインポート
 * <HorizontalScrollProvider>
 *  <div ref={scrollRef}>...コンテンツ</div>
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

			// 横スクロールの入力の場合、処理を行わない
			if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

			// スクロールの限界に達している場合、縦スクロールを許可
			if (
				(scrollElement.scrollLeft <= 0 && e.deltaY < 0) ||
				(scrollElement.scrollLeft >= maxScrollLeft && e.deltaY > 0)
			) {
				return;
			}

			// 縦スクロールを横スクロールに変換
			e.preventDefault();
			scrollElement.scrollLeft += e.deltaY;
		};

		// イベントリスナーの追加
		scrollElement.addEventListener("wheel", handleWheel);

		// クリーンアップ関数
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

// カスタムフックでコンテキストを使用する
export const useHorizontalScroll = (): RefObject<HTMLDivElement> => {
	const context = useContext(HorizontalScrollContext);
	if (!context) {
		throw new Error(
			"useHorizontalScroll must be used within a HorizontalScrollProvider",
		);
	}
	return context.scrollRef;
};
