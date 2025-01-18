import type { HTTP_STATUSES } from "@/constants";
import type { DB } from "@/db";
import type { TUser } from "@/db/schema";
import { type OpenAPIHono, type RouteConfig, type RouteHandler, z } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { StatusCode } from "hono/utils/http-status";
import type { JWTPayload } from "hono/utils/jwt/types";
import type { createErrorSchema } from "./schema.helpers";
export type { StatusCode } from "hono/utils/http-status";

export type TJWTPayload = JWTPayload & { id: string };

// APP TYPES
export interface AppBindings {
	Variables: {
		logger: PinoLogger;
		db: DB;
		jwtPayload: TJWTPayload | undefined;
		userData: TUser;
	};
}

export type AppInstance = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

// HTTP STATUS TYPES
export type StatusCodeText = keyof typeof HTTP_STATUSES;

// SCHEMA
const zodIssueSchema = z.object({
	issues: z.record(z.string(), z.string().array().optional()).openapi({ example: { field_1: ["issue_1", "issue_2"] } }),
	name: z.string().openapi({ example: "ZodErrors" }),
});

// SCHMEA TYPES
export type TDescriptionExample<T = string> = {
	description?: string;
	example?: T;
};

const EmptyObject = z.object({});

export type TError<T extends z.AnyZodObject = typeof EmptyObject> = z.infer<ReturnType<typeof createErrorSchema<T>>>;

export type TValidationError = TError<typeof zodIssueSchema>;

// Base types without circular references
type BaseErrorFields = {
	message?: string;
	code?: string;
	stack?: string;
};

type BaseExample = {
	status?: StatusCode;
	statusText?: StatusCodeText;
	error?: BaseErrorFields;
};

export type TExample<T extends z.ZodType = z.ZodType> = BaseExample & {
	error?: BaseErrorFields & Partial<z.infer<T>>;
};
