import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES } from "@/constants";
import { z } from "@/db/lib";
import { createErrorSchema, createJson, createMessageSchema } from "@/helpers/schema.helpers";

export const home = createRoute({
	method: "get",
	path: "/",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Home route",
			schema: createMessageSchema({ example: "Hello World!" }),
		}),
	},
	tags: ["Internal"],
});

export const healthCheck = createRoute({
	method: "get",
	path: "/health",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Health check route to check the API and DB connection",
			schema: createMessageSchema({
				description: "API and DB connection is healthy",
				example: "API and DB connection is healthy",
			}).extend({
				data: z.object({
					command: z.string().meta({ description: "Command used to check", example: "SELECT 1" }),
				}),
			}),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Health check route to check the API and DB connection",
			schema: createErrorSchema(),
		}),
	},
	tags: ["Internal"],
});

export type THomeRoute = typeof home;
export type THealthCheckRoute = typeof healthCheck;
