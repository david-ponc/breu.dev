import Elysia, { ValidationError } from 'elysia';
import { match, P } from 'ts-pattern';

import { STATUS_CODES } from '#/core/lib/http/status-codes';
import { logger } from '#/core/lib/logging';

import { LINK_ERROR } from '../../domain/errors/codes';
import { LinkNotFoundError } from '../../domain/errors/link-not-found';
import { LinkSlugUnavailableError } from '../../domain/errors/link-slug-unavailable';
import { MetaCollectionFailedError } from '../../domain/errors/meta-collection-failed';
import { SlugSuggestionFailedError } from '../../domain/errors/slug-suggestion-failed';

export const errorHandler = new Elysia({ name: 'brevis.error-handling' })
	.error({
		[LINK_ERROR.SlugUnavailable]: LinkSlugUnavailableError,
		[LINK_ERROR.SlugSuggestionFailed]: SlugSuggestionFailedError,
		[LINK_ERROR.MetaCollectionFailed]: MetaCollectionFailedError,
		[LINK_ERROR.NotFound]: LinkNotFoundError,
	})
	.onError({ as: 'scoped' }, ({ code, error, set }) =>
		match({ code, error })
			.with({ code: 'VALIDATION', error: P.instanceOf(ValidationError) }, ({ error }) => {
				set.status = error.status;
				return {
					code,
					message: error.customError,
					errors: error.all,
				};
			})
			.with(
				{
					code: LINK_ERROR.SlugUnavailable,
					error: P.instanceOf(LinkSlugUnavailableError),
				},
				({ error }) => {
					set.status = STATUS_CODES.Conflict;
					return { code, message: error.message };
				},
			)
			.with(
				{
					code: LINK_ERROR.SlugSuggestionFailed,
					error: P.instanceOf(SlugSuggestionFailedError),
				},
				({ error }) => {
					set.status = STATUS_CODES.ServiceUnavailable;
					return { code, message: error.message };
				},
			)
			.with(
				{
					code: LINK_ERROR.MetaCollectionFailed,
					error: P.instanceOf(MetaCollectionFailedError),
				},
				({ error }) => {
					set.status = STATUS_CODES.UnprocessableEntity;
					return { code, message: error.message };
				},
			)
			.with(
				{ code: LINK_ERROR.NotFound, error: P.instanceOf(LinkNotFoundError) },
				({ error }) => {
					set.status = STATUS_CODES.NotFound;
					return { code, message: error.message };
				},
			)
			.otherwise(() => {
				logger.error(
					{ err: error, code },
					'[brevis.links.error-handling] Unhandled error',
				);
				set.status = STATUS_CODES.InternalServerError;
				return { code: 'INTERNAL_ERROR', message: 'Something went wrong' };
			}),
	);
