import Elysia, { ValidationError } from 'elysia';
import { match, P } from 'ts-pattern';

import { STATUS_CODES } from '#/core/lib/http/status-codes';
import { logger } from '#/core/lib/logging';

import { LINK_ERROR } from '../../domain/errors/codes';
import { LinkNotActiveError } from '../../domain/errors/link-not-active';
import { LinkSlugNotFoundError } from '../../domain/errors/link-slug-not-found';

export const errorHandler = new Elysia({ name: 'redirect.error-handling' })
	.error({
		[LINK_ERROR.SlugNotFound]: LinkSlugNotFoundError,
		[LINK_ERROR.NotActive]: LinkNotActiveError,
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
				{ code: LINK_ERROR.SlugNotFound, error: P.instanceOf(LinkSlugNotFoundError) },
				({ error }) => {
					set.status = STATUS_CODES.NotFound;
					return { code, message: error.message };
				},
			)
			.with(
				{ code: LINK_ERROR.NotActive, error: P.instanceOf(LinkNotActiveError) },
				({ error }) => {
					set.status = STATUS_CODES.Gone;
					return { code, message: error.message };
				},
			)
			.otherwise(() => {
				logger.error(
					{ err: error, code },
					'[redirect.links.error-handling] Unhandled error',
				);
				set.status = STATUS_CODES.InternalServerError;
				return { code: 'INTERNAL_ERROR', message: 'Something went wrong' };
			}),
	);
