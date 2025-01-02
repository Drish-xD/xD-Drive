import { HTTP_STATUSES } from "@/constants";
import { insertUserSchema, loginUserSchema, selectUserSchema } from "@/db/schema";
import { createErrorSchema, createJson, createZodIssueSchema } from "@/helpers/schema.helpers";
import { createRoute, z } from "@hono/zod-openapi";

/**
 * Register User route
 */
export const register = createRoute({
	path: "/register",
	method: "post",
	tags: ["Auth"],
	request: {
		body: createJson({
			description: "Body to register new user",
			schema: insertUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Register New User",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.CONFLICT.CODE]: createJson({
			description: "User already exists",
			schema: createErrorSchema({
				detailsSchema: z.object({ userId: z.string().uuid() }),
				example: {
					code: "CONFLICT",
					message: "User already exists",
					stack: "auth.handlers.register#001",
					details: {
						userId: "123e4567-e89b-12d3-a456-426614174000",
					},
				},
			}),
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createJson({
			description: "Unprocessable Entity",
			schema: createZodIssueSchema(),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Internal Server Error",
			schema: createErrorSchema(),
		}),
	},
});

export type TRegisterRoute = typeof register;

/**
 * Login User route
 */
export const login = createRoute({
	path: "/login",
	method: "post",
	tags: ["Auth"],
	request: {
		body: createJson({
			description: "Body to login user",
			schema: loginUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Login User with credentials",
			schema: z.object({
				message: z.string(),
			}),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({
			description: "User not found",
			schema: createErrorSchema({
				example: {
					code: "NOT_FOUND",
					message: "User not found",
					stack: "auth.handlers.login#001",
					details: "",
				},
			}),
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createJson({
			description: "Unprocessable Entity",
			schema: createZodIssueSchema(),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Internal Server Error",
			schema: createErrorSchema(),
		}),
	},
});

export type TLoginRoute = typeof login;

// /**
//  * Refresh Token route
//  */
// export const refreshToken = createRoute({
// 	path: "/refresh-token",
// 	method: "post",
// 	tags: ["Auth"],
// 	responses: {
// 		200: createJson({
// 			description: "Refresh Token",
// 			schema: createMessageSchema({
// 				description: "Message to show token is refreshed",
// 				example: "Token successfully refreshed!",
// 			}),
// 		}),
// 	},
// });

// export type TRefreshTokenRoute = typeof refreshToken;
