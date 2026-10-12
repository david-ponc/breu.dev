// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ensureHttpsProtocol } from '#/core/lib/url';

const getSessionMock = vi.hoisted(() => vi.fn());
const signInAnonymousMock = vi.hoisted(() => vi.fn());
const slugsGetMock = vi.hoisted(() => vi.fn());
const linksPutMock = vi.hoisted(() => vi.fn());
const toastAddMock = vi.hoisted(() => vi.fn());

vi.mock('#/core/lib/auth/client', () => ({
	authClient: {
		getSession: getSessionMock,
		signIn: { anonymous: signInAnonymousMock },
	},
}));

vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({
		brevis: {
			links: Object.assign((_params: { id: string }) => ({ put: linksPutMock }), {
				slugs: { get: slugsGetMock },
			}),
		},
	}),
}));

vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: toastAddMock },
}));

import { useQuickLink } from './use-quick-link';

const LINK_RESPONSE = { slug: 'brave-fox', url: 'https://example.com/x' };

function allowSessionlessFlow() {
	getSessionMock.mockResolvedValue({ data: null });
	signInAnonymousMock.mockResolvedValue({ error: null });
	slugsGetMock.mockResolvedValue({ data: { slug: 'brave-fox' }, error: null });
	linksPutMock.mockResolvedValue({ data: LINK_RESPONSE, error: null });
}

async function submit(
	result: {
		current: {
			form: {
				setFieldValue(name: 'url', value: string): void;
				handleSubmit(): Promise<void>;
			};
		};
	},
	url: string,
) {
	await act(async () => {
		result.current.form.setFieldValue('url', ensureHttpsProtocol(url));
		await result.current.form.handleSubmit();
	});
}

describe('useQuickLink', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects an invalid URL without touching the network', async () => {
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'not a url');

		expect(result.current.status).toBe('idle');
		expect(result.current.form.state.fieldMeta.url?.errors.length).toBeGreaterThan(0);
		expect(getSessionMock).not.toHaveBeenCalled();
		expect(linksPutMock).not.toHaveBeenCalled();
	});

	it('signs in anonymously, reserves a slug and creates the link', async () => {
		allowSessionlessFlow();
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'example.com/x');

		expect(signInAnonymousMock).toHaveBeenCalledTimes(1);
		expect(linksPutMock).toHaveBeenCalledWith({
			url: 'https://example.com/x',
			slug: 'brave-fox',
			comments: '',
			meta: null,
		});
		expect(result.current.status).toBe('success');
		expect(result.current.created).toEqual({
			linkId: expect.any(String),
			slug: 'brave-fox',
			url: 'https://example.com/x',
		});
	});

	it('skips the anonymous sign-in when a session already exists', async () => {
		getSessionMock.mockResolvedValue({ data: { user: {}, session: {} } });
		slugsGetMock.mockResolvedValue({ data: { slug: 'calm-owl' }, error: null });
		linksPutMock.mockResolvedValue({
			data: { ...LINK_RESPONSE, slug: 'calm-owl' },
			error: null,
		});
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'example.com');

		expect(signInAnonymousMock).not.toHaveBeenCalled();
		expect(result.current.status).toBe('success');
	});

	it('does not create another link after success', async () => {
		allowSessionlessFlow();
		const { result } = renderHook(() => useQuickLink());
		await submit(result, 'example.com');
		await submit(result, 'example.com/another');
		expect(linksPutMock).toHaveBeenCalledTimes(1);
		expect(result.current.status).toBe('success');
	});

	it('treats the anonymous-already-signed-in error as success', async () => {
		getSessionMock.mockResolvedValue({ data: null });
		signInAnonymousMock.mockResolvedValue({
			error: { code: 'ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY' },
		});
		slugsGetMock.mockResolvedValue({ data: { slug: 'brave-fox' }, error: null });
		linksPutMock.mockResolvedValue({ data: LINK_RESPONSE, error: null });
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'example.com');

		expect(result.current.status).toBe('success');
	});

	it('shows an inline error and creates no link when the rate limit rejects the sign-in', async () => {
		getSessionMock.mockResolvedValue({ data: null });
		signInAnonymousMock.mockResolvedValue({
			error: { status: 429, message: 'Too many anonymous sign-ins, try again later.' },
		});
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'example.com');

		expect(result.current.status).toBe('idle');
		expect(result.current.inputError).toMatch(/too many links/i);
		expect(slugsGetMock).not.toHaveBeenCalled();
		expect(linksPutMock).not.toHaveBeenCalled();
		expect(toastAddMock).not.toHaveBeenCalled();
	});

	it('returns to idle and raises a toast when the link creation fails', async () => {
		getSessionMock.mockResolvedValue({ data: null });
		signInAnonymousMock.mockResolvedValue({ error: null });
		slugsGetMock.mockResolvedValue({ data: { slug: 'brave-fox' }, error: null });
		linksPutMock.mockResolvedValue({ error: { value: { message: 'meta failed' } } });
		const { result } = renderHook(() => useQuickLink());

		await submit(result, 'example.com');

		expect(result.current.status).toBe('idle');
		expect(result.current.created).toBeNull();
		expect(toastAddMock).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'error', description: 'meta failed' }),
		);
	});
});
