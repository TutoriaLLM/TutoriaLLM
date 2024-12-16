/// <reference types="vite/client" />
interface ImportMetaEnv {
	readonly VITE_PUBLIC_BACKEND_URL: string;
	readonly PORT: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
