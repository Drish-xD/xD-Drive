import { HTTP_STATUSES } from "@/constants";
import { getStatusKeyByCode } from "@/helpers/other.helpers";
import type { StatusCode, StatusCodeText, TError, TValidationError } from "@/helpers/types";
import type { Hook } from "@hono/zod-openapi";
import type { Context, Env, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const onError: ErrorHandler = (error, ctx) => {
	if (error instanceof ZodError) {
		const { flatten, name, message, stack, cause } = error;

		return ctx.json<TValidationError>(
			{
				status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
				statusText: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
				error: {
					code: String(cause ?? "on-error.middleware@onError#001"),
					stack,
					message,
					name,
					issues: flatten().fieldErrors,
				},
			},
			{ status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE },
		);
	}

	if (error instanceof HTTPException) {
		console.log(error);
		return ctx.json<TError>(
			{
				status: error.status,
				statusText: getStatusKeyByCode(error.status),
				error: {
					message: error?.message,
					code: String(error?.cause ?? "on-error.middleware@onError#002"),
					stack: error?.stack,
				},
			},
			{ status: error.status },
		);
	}

	return ctx.json<TError>(
		{
			status: HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE,
			statusText: HTTP_STATUSES.INTERNAL_SERVER_ERROR.KEY,
			error: {
				code: String(error?.cause ?? "on-error.middleware@onError#003"),
				message: error?.message,
				stack: error?.stack,
			},
		},
		{ status: HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE },
	);
};

// biome-ignore lint/suspicious/noExplicitAny: This is a generic hook that can be used in any context.
export const handleZodError = <E extends Env>(result: Parameters<Hook<any, Env, any, any>>["0"], ctx: Context) => {
	if (!result.success) {
		const status = ctx.res.status as StatusCode;
		const statusText = ctx.res.statusText as StatusCodeText;
		const { flatten, name, message, stack, cause } = result.error;

		return ctx.json<TValidationError>(
			{
				status,
				statusText,
				error: {
					stack,
					name,
					message,
					issues: flatten().fieldErrors,
					code: String(cause ?? "on-error.middleware@onError#001"),
				},
			},
			{ status },
		);
	}
};
