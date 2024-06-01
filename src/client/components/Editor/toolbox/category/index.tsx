//カテゴリとブロックのJSONの型定義（を提供したい）
// export type BlockJson = {
//   kind: "block";
//   type: string;
//   extraState?: any;
// };

// export type CategoryJson = {
//   kind: "category";
//   name: string;
//   colour: string;
//   contents: Array<CategoryJson | BlockJson>;
// };

//カテゴリのインポート
import logic from "./logic";

//まとめたカテゴリのエクスポート
export const categoryContents = [logic];
export default categoryContents;
