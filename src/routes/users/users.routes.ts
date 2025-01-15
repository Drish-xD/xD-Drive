import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { selectUserSchema } from "@/db/schema";
import { createErrorJson, createJson } from "@/helpers/schema.helpers";
import { createRoute } from "@hono/zod-openapi";

/**
 * Current User route
 */
export const me = createRoute({
	path: "/me",
	method: "get",
	tags: ["Users"],
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUsersMeRoute = typeof me;
