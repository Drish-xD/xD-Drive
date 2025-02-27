import { HTTP_STATUSES } from "@/constants";
import { getStatusKeyByCode } from "@/helpers/other.helpers";
import type { AppBindings, TError, TValidationError } from "@/helpers/types";
import type { Hook } from "@hono/zod-openapi";
import type { Context, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const onError: ErrorHandler = (error, ctx) => {
	if (error instanceof ZodError) {
		return ctx.json<TValidationError>(
			{
				status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
				statusText: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#001"),
					message: error?.message ?? "Validation failed",
					name: error?.name ?? "ZodError",
					issues: error?.flatten().fieldErrors ?? {},
					stack: error?.stack ?? "",
				},
			},
			{ status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE },
		);
	}

	if (error instanceof HTTPException) {
		return ctx.json<TError>(
			{
				status: error.status,
				statusText: getStatusKeyByCode(error.status),
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#002"),
					message: error?.message ?? "Something went wrong",
					stack: error?.stack ?? "",
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
				message: error?.message ?? "Something went wrong",
				stack: error?.stack ?? "",
			},
		},
		{ status: HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE },
	);
};

// biome-ignore lint/suspicious/noExplicitAny: Function needs to handle any parameter type
export const handleZodError = (result: Parameters<Hook<any, AppBindings, any, any>>["0"], ctx: Context<AppBindings, any>) => {
	if (!result.success) {
		const { error, target } = result;

		ctx.var.logger.trace({ target, error }, "Zod Validation error");

		return ctx.json<TValidationError>(
			{
				status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
				statusText: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
				error: {
					code: String(error?.cause ?? "on-error.middleware@onError#001"),
					message: `Validation failed for '${target}'. Please ensure the provided value meets the required criteria.`,
					name: error?.name ?? "ZodError",
					issues: error?.flatten().fieldErrors ?? {},
					stack: error?.stack ?? "",
				},
			},
			{ status: HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE },
		);
	}
};
