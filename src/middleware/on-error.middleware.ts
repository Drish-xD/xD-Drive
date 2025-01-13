import type { StatusCode, StatusCodeText, TError, TValidationError } from "@/helpers/types";
import type { Hook } from "@hono/zod-openapi";
import type { Context, Env, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const onError: ErrorHandler = (error, ctx) => {
	const status = ctx.res.status as StatusCode;
	const statusText = ctx.res.statusText as StatusCodeText;

	if (error instanceof ZodError) {
		const { flatten, name, message, stack, cause } = error;

		return ctx.json<TValidationError>(
			{
				status,
				statusText,
				error: {
					code: String(cause ?? "on-error.middleware@onError#001"),
					stack,
					message,
					name,
					issues: flatten().fieldErrors,
				},
			},
			{ status },
		);
	}

	if (error instanceof HTTPException) {
		return ctx.json<TError>(
			{
				status,
				statusText,
				error: {
					message: error?.message,
					code: String(error?.cause ?? "on-error.middleware@onError#002"),
					stack: error?.stack,
				},
			},
			{ status },
		);
	}

	return ctx.json<TError>(
		{
			status,
			statusText,
			error: {
				code: String(error?.cause ?? "on-error.middleware@onError#003"),
				message: error?.message,
				stack: error?.stack,
			},
		},
		{ status },
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
