Object.assign(process.env, {
	BASE_URL: 'http://localhost:3000',
	DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
	RABBITMQ_URL: 'amqp://guest:guest@localhost:5672',
	BETTER_AUTH_SECRET: 'test-secret-for-testing-purposes-only-32chars',
	BETTER_AUTH_URL: 'http://localhost:3000',
	GITHUB_CLIENT_ID: 'test-client-id',
	GITHUB_CLIENT_SECRET: 'test-client-secret',
	AI_GATEWAY_API_KEY: 'test-ai-gateway-api-key',
	AI_SLUG_MODEL: 'openai/gpt-4.1-mini',
	NODE_ENV: 'test',
});
