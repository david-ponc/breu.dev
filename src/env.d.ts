/// <reference types="vite/client" />

interface ImportMetaEnv {
	// Client-side environment variables
	readonly VITE_APP_NAME: string;
	readonly VITE_API_URL: string;
	readonly VITE_BASE_URL: string;
}

// biome-ignore lint/correctness/noUnusedVariables: The ImportMeta interface is required for Vite to recognize the ImportMetaEnv type
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Server-side environment variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly BASE_URL: string;
			readonly DATABASE_URL: string;
			readonly REDIS_URL: string;
			readonly JWT_SECRET: string;
			readonly NODE_ENV: 'development' | 'production' | 'test';
		}
	}
}

export {};
