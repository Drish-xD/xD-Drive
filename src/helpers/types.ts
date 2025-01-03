import type { HTTP_STATUSES } from "@/constants";
import type { DB } from "@/db";
import { type OpenAPIHono, type RouteConfig, type RouteHandler, z } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { StatusCode } from "hono/utils/http-status";
import type { createErrorSchema } from "./schema.helpers";
export type { StatusCode } from "hono/utils/http-status";

// APP TYPES
export interface AppBindings {
	Variables: {
		logger: PinoLogger;
		db: DB;
	};
}

export type AppInstance = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

// HTTP STATUS TYPES
export type StatusCodeText = keyof typeof HTTP_STATUSES;

// SCHEMA
export const issueSchema = z.object({
	issues: z.array(z.record(z.string(), z.string().array().optional())),
	name: z.string(),
});

export const BaseSchema = z.object({
	status: z.custom<StatusCode>().openapi({ description: "Error status code to trace the error." }),
	statusText: z.custom<StatusCodeText>().openapi({ description: "Status text based on the status code." }),
});

export const BaseErrorSchema = z.object({
	code: z.string().openapi({ description: "Traceable error code. - [route_path]@[function]#[unique_code]" }),
	message: z.string().openapi({ description: "Error message." }),
	stack: z.string().optional().openapi({ description: "Stack trace of the error." }),
});

// SCHMEA TYPES
export type TDescriptionExample = { description?: string; example?: string };

export type TError<T extends z.AnyZodObject = typeof BaseErrorSchema> = z.infer<ReturnType<typeof createErrorSchema<T>>>;

export type TValidationError = TError<typeof issueSchema>;

export type TExample<T extends z.AnyZodObject> = {
	status?: StatusCode;
	statusText?: StatusCodeText;
	error?: {
		message?: string;
		code?: string;
		stack?: string;
	} & z.infer<T>;
};
