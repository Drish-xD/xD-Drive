import type { Hook } from "@hono/zod-openapi";
import type { Context, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { HTTP_STATUSES } from "@/constants";
import { getStatusKeyByCode } from "@/helpers/other.helpers";
import type { AppBindings, TError, TValidationError } from "@/helpers/types";

export const onError: ErrorHandler = (error, ctx) => {
	if (error instanceof ZodError) {
		return ctx.json<TValidationError>(
			{
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#001"),
					issues: error?.flatten().fieldErrors ?? {},
					message: error?.message ?? "Validation failed",
					name: error?.name ?? "ZodError",
					stack: error?.stack ?? "",
				},
				status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
				statusText: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
			},
			{ status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE },
		);
	}

	if (error instanceof HTTPException) {
		return ctx.json<TError>(
			{
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#002"),
					message: error?.message ?? "Something went wrong",
					stack: error?.stack ?? "",
				},
				status: error.status,
				statusText: getStatusKeyByCode(error.status),
			},
			{ status: error.status },
		);
	}

	return ctx.json<TError>(
		{
			error: {
				code: String(error?.cause ?? "on-error.middleware@onError#003"),
				message: error?.message ?? "Something went wrong",
				stack: error?.stack ?? "",
			},
			status: HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE,
			statusText: HTTP_STATUSES.INTERNAL_SERVER_ERROR.KEY,
		},
		{ status: HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE },
	);
};

// biome-ignore lint/suspicious/noExplicitAny: Function needs to handle any parameter type
export const handleZodError = (result: Parameters<Hook<any, AppBindings, any, any>>["0"], ctx: Context<AppBindings, any>) => {
	if (!result.success) {
		const { error, target } = result;

		ctx.var.logger.trace({ error, target }, "Zod Validation error");

		return ctx.json<TValidationError>(
			{
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#001"),
					issues: error?.flatten().fieldErrors ?? {},
					message: `Validation failed for '${target}'. Please ensure the provided value meets the required criteria.`,
					name: error?.name ?? "ZodError",
					stack: error?.stack ?? "",
				},
				status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
				statusText: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
			},
			{ status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE },
		);
	}
};
