/// <reference types="vite/client" />

interface ImportMetaEnv {
	// Client-side environment variables
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
			readonly RABBITMQ_URL: string;
			readonly BETTER_AUTH_SECRET: string;
			readonly BETTER_AUTH_URL: string;
			readonly GITHUB_CLIENT_ID: string;
			readonly GITHUB_CLIENT_SECRET: string;
			readonly AI_GATEWAY_API_KEY: string;
			readonly AI_SLUG_MODEL?: string;
			readonly NODE_ENV: 'development' | 'production' | 'test';
		}
	}
}

export {};
