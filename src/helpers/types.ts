import type { HTTP_STATUSES } from "@/constants";
import type { DB } from "@/db";
import type { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
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

export type TError<T = unknown> = z.infer<ReturnType<typeof createErrorSchema>> & {
	details?: T;
};
