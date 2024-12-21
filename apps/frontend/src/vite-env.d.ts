/// <reference types="vite/client" />

declare const VITE_BACKEND_URL: string;
interface ImportMetaEnv {
	readonly PORT: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
