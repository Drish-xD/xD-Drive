import { HTTP_STATUSES } from "@/constants";
import { createErrorSchema, createJson, createMessageSchema } from "@/helpers/schema.helpers";
import { createRoute, z } from "@hono/zod-openapi";

export const home = createRoute({
	path: "/",
	method: "get",
	tags: ["Internal"],
	responses: {
		200: createJson({
			description: "Home route",
			schema: createMessageSchema({ example: "Hello World!" }),
		}),
	},
});

export const healthCheck = createRoute({
	path: "/health",
	method: "get",
	tags: ["Internal"],
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Health check route to check the API and DB connection",
			schema: createMessageSchema({
				description: "API and DB connection is healthy",
				example: "API and DB connection is healthy",
			}).extend({
				data: z.object({
					command: z.string().openapi({ description: "Command used to check", example: "SELECT 1" }),
					rowCount: z.number().openapi({ description: "Number of rows returned", example: 1 }),
				}),
			}),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Health check route to check the API and DB connection",
			schema: createErrorSchema(),
		}),
	},
});

export type THomeRoute = typeof home;
export type THealthCheckRoute = typeof healthCheck;
