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

// SCHMEA TYPES
export type TDescriptionExample = { description?: string; example?: string };

const EmptyObject = z.object({});
export type TError<T extends z.AnyZodObject = typeof EmptyObject> = z.infer<ReturnType<typeof createErrorSchema<T>>>;

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
