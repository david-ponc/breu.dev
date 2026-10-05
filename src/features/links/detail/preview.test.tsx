// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Link, Meta } from '#/contexts/brevis/links/domain/link';

import { LinkDetailPreview } from './preview';

const preview = vi.hoisted(() => ({ link: null as Link | null }));
vi.mock('@tanstack/react-query', () => ({
	useSuspenseQuery: () => ({ data: preview.link }),
}));
vi.mock('./query', () => ({ userLinkQueryOptions: vi.fn() }));

const EMPTY_META: Meta = {
	author: null,
	favicon: null,
	title: null,
	description: null,
	openGraph: { title: null, description: null, image: null },
};

function aLink(meta: Meta | null): Link {
	return {
		id: '01992611-0000-7000-8000-000000000001',
		userId: '01992611-0000-7000-8000-000000000002',
		slug: 'example-link',
		url: 'https://example.com',
		comments: 'My notes',
		meta,
		status: 'active',
		createdAt: '2026-09-01T12:00:00Z',
		updatedAt: '2026-09-01T12:00:00Z',
	};
}

function renderPreview() {
	return render(<LinkDetailPreview linkId='link-id' userId='user-id' />);
}

beforeEach(() => {
	preview.link = aLink(EMPTY_META);
});
afterEach(cleanup);

describe('LinkDetailPreview', () => {
	it.each([true, false])(
		'resolves text with non-empty Open Graph values: %s',
		(hasOgText) => {
			preview.link = aLink({
				...EMPTY_META,
				title: ' HTML title ',
				description: ' HTML description ',
				author: ' HTML author ',
				openGraph: {
					title: hasOgText ? ' OG title ' : ' ',
					description: hasOgText ? ' OG description ' : '\n',
					author: hasOgText ? ' OG author ' : '\t',
					image: null,
				},
			});
			renderPreview();
			for (const field of ['title', 'description', 'author']) {
				const expected = `${hasOgText ? 'OG' : 'HTML'} ${field}`;
				expect(screen.getByText(expected).textContent).toBe(expected);
				expect(screen.queryByText(`${hasOgText ? 'HTML' : 'OG'} ${field}`)).toBeNull();
			}
		},
	);

	it('omits empty fields and preserves metadata order', () => {
		preview.link = aLink({
			...EMPTY_META,
			author: ' Ada ',
			openGraph: {
				title: null,
				description: null,
				image: null,
				siteName: '\t',
				type: ' article ',
				locale: null,
				section: ' Technology ',
				publishedTime: ' 2026-09-01T12:00:00Z ',
			},
		});
		renderPreview();
		expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
			'Author',
			'Type',
			'Section',
			'Published',
		]);
		expect(
			screen.getAllByRole('definition').map((definition) => definition.textContent),
		).toEqual(['Ada', 'article', 'Technology', '2026-09-01T12:00:00Z']);
	});

	it('shows a preview with only tags, cleaned and deduplicated in source order', () => {
		preview.link = aLink({
			...EMPTY_META,
			openGraph: {
				title: null,
				description: null,
				image: null,
				tags: [' TypeScript ', 'React', 'TypeScript', ' ', ' React '],
			},
		});
		renderPreview();
		expect(screen.queryByText('No preview available')).toBeNull();
		expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['Tags']);
		expect(
			Array.from(screen.getByRole('definition').children, (tag) => tag.textContent),
		).toEqual(['TypeScript', 'React']);
	});

	it('refreshes derived content when query data changes and clears it when empty', () => {
		preview.link = aLink({ ...EMPTY_META, title: 'Old title', author: 'Old author' });
		const { rerender } = renderPreview();
		preview.link = aLink({
			...EMPTY_META,
			title: 'New title',
			description: 'New description',
		});
		rerender(<LinkDetailPreview linkId='link-id' userId='user-id' />);
		expect(screen.getByText('New title')).toBeDefined();
		expect(screen.getByText('New description')).toBeDefined();
		expect(screen.queryByText('Old title')).toBeNull();
		expect(screen.queryByText('Old author')).toBeNull();
		expect(screen.queryByRole('term')).toBeNull();
		preview.link = aLink(null);
		rerender(<LinkDetailPreview linkId='link-id' userId='user-id' />);
		expect(screen.getByText('No preview available')).toBeDefined();
		expect(screen.queryByText('New title')).toBeNull();
		expect(screen.queryByText('New description')).toBeNull();
	});

	it.each([null, EMPTY_META, { ...EMPTY_META, openGraph: null }])(
		'uses Empty when metadata is absent or empty (%j)',
		(meta) => {
			preview.link = aLink(meta);
			const { container } = renderPreview();
			expect(container.querySelector('[data-slot="empty"]')).not.toBeNull();
			expect(screen.getByText('No preview available')).toBeDefined();
			expect(screen.getByText('My notes')).toBeDefined();
			expect(screen.queryByText('No image available')).toBeNull();
		},
	);

	it('treats whitespace-only metadata as empty', () => {
		preview.link = aLink({
			...EMPTY_META,
			title: ' ',
			description: '\n',
			author: ' ',
			openGraph: {
				title: ' ',
				description: '\n',
				image: null,
				tags: [' '],
				siteName: ' ',
			},
		});
		renderPreview();
		expect(screen.getByText('No preview available')).toBeDefined();
	});

	it('keeps title and description fallbacks and shows a missing image placeholder', () => {
		preview.link = aLink({
			...EMPTY_META,
			title: 'HTML title',
			description: 'HTML description',
		});
		renderPreview();
		expect(screen.getByText('HTML title')).toBeDefined();
		expect(screen.getByText('HTML description')).toBeDefined();
		expect(screen.getByText('No image available')).toBeDefined();
	});

	it.each([
		{ title: 'OG title', description: null, missing: 'No description available' },
		{ title: null, description: 'OG description', missing: 'No title available' },
	])('shows the missing text field: $missing', ({ title, description, missing }) => {
		preview.link = aLink({
			...EMPTY_META,
			openGraph: { title, description, image: null },
		});
		renderPreview();
		expect(screen.getByText(title || description || '')).toBeDefined();
		expect(screen.getByText(missing)).toBeDefined();
	});

	it('replaces broken images and retries when the image URL changes', () => {
		preview.link = aLink({
			...EMPTY_META,
			openGraph: {
				title: 'OG title',
				description: null,
				image: 'https://example.com/one.png',
			},
		});
		const { container, rerender } = renderPreview();
		const image = container.querySelector('img');
		expect(image?.getAttribute('src')).toBe('https://example.com/one.png');
		fireEvent.error(image as HTMLImageElement);
		expect(container.querySelector('img')).toBeNull();
		expect(screen.getByText('No image available')).toBeDefined();
		preview.link = aLink({
			...EMPTY_META,
			openGraph: {
				title: 'OG title',
				description: null,
				image: 'https://example.com/two.png',
			},
		});
		rerender(<LinkDetailPreview linkId='link-id' userId='user-id' />);
		expect(container.querySelector('img')?.getAttribute('src')).toBe(
			'https://example.com/two.png',
		);
		expect(screen.queryByText('No image available')).toBeNull();
	});

	it('renders supplemental metadata even without title, description or image', () => {
		preview.link = aLink({
			...EMPTY_META,
			openGraph: {
				title: null,
				description: null,
				image: null,
				author: 'Ada Lovelace',
				tags: ['React', 'TypeScript', ' React ', ' '],
				siteName: 'Example Magazine',
				type: 'article',
				locale: 'en_US',
				section: 'Technology',
				publishedTime: '2026-09-01T12:00:00Z',
				modifiedTime: '2026-09-02T12:00:00Z',
			},
		});
		renderPreview();
		for (const value of [
			'Ada Lovelace',
			'React',
			'TypeScript',
			'Example Magazine',
			'article',
			'en_US',
			'Technology',
			'2026-09-01T12:00:00Z',
			'2026-09-02T12:00:00Z',
			'No title available',
			'No description available',
			'No image available',
		]) {
			expect(screen.getAllByText(value)).toHaveLength(1);
		}
		expect(screen.queryByText('No preview available')).toBeNull();
	});

	it('displays the author from previously saved metadata', () => {
		preview.link = aLink({ ...EMPTY_META, author: 'Grace Hopper' });
		renderPreview();
		expect(screen.getByText('Grace Hopper')).toBeDefined();
		expect(screen.queryByText('No preview available')).toBeNull();
	});

	it('keeps long text, tags and comments readable in a keyboard-focusable region', () => {
		const title = 'A long title '.repeat(50).trim();
		const description = 'A complete description '.repeat(100).trim();
		const comments = `https://example.com/${'long-path'.repeat(100)}`;
		preview.link = {
			...aLink({
				...EMPTY_META,
				openGraph: {
					title,
					description,
					image: null,
					tags: Array.from({ length: 50 }, (_, index) => `Topic ${index + 1}`),
				},
			}),
			comments,
		};
		renderPreview();
		const region = screen.getByRole('region', { name: 'Link preview details' });
		region.focus();
		expect(document.activeElement).toBe(region);
		for (const text of [title, description, comments, 'Topic 50']) {
			expect(region.contains(screen.getByText(text))).toBe(true);
		}
	});
});
