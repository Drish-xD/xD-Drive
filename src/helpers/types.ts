import type { HTTP_STATUSES } from "@/constants";
import type { DB } from "@/db";
import type { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { ZodTypeAny, ZodUnknown } from "zod";
import type { createErrorSchema } from "./schema.helpers";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
		db: DB;
	};
}

export type AppInstance = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type HTTP_STATUS = {
	readonly CODE: number;
	readonly PHRASE: string;
	readonly KEY: string;
};

export type HTTP_STATUS_CODE = keyof typeof HTTP_STATUSES | (string & {});

export type TValidationError = TError<
	z.ZodObject<{
		errors: z.ZodRecord<z.ZodString | z.ZodSymbol | z.ZodNumber, z.ZodArray<z.ZodString> | z.ZodUndefined>;
	}>
>;

export type TError<T extends ZodSchema = ZodSchema> = z.infer<ReturnType<typeof createErrorSchema<T>>>;

// @ts-expect-error
export type ZodSchema = z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;

/**
 * Error schema to return in case of an error.
 */

export type BaseErrorSchema<T extends ZodTypeAny> = z.ZodObject<{
	code: z.ZodEnum<[HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]>;
	message: z.ZodString;
	stack: z.ZodOptional<z.ZodString>;
	details: T;
}>;

export type TExample<T extends ZodTypeAny> = {
	code?: HTTP_STATUS_CODE;
	message?: string;
	stack?: string;
	details?: z.infer<T>;
};

export type CreateErrorSchema = {
	<T extends ZodUnknown>(param?: { detailsSchema?: T; example?: TExample<T> }): BaseErrorSchema<T>;
	<T extends ZodSchema>(param?: { detailsSchema?: T; example?: TExample<T> }): BaseErrorSchema<T>;
};
