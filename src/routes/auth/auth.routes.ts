import { insertUserSchema, loginUserSchema, selectUserSchema } from "@/db/schema";
import { createErrorSchema, createJson, createMessageSchema, createZodIssueSchema } from "@/helpers/schema.helpers";
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
		200: createJson({
			description: "Register New User",
			schema: selectUserSchema,
		}),
		409: createJson({
			description: "User already exists",
			schema: createErrorSchema(
				z.object({
					userId: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
				}),
			).openapi({
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
		422: createJson({
			description: "Unprocessable Entity",
			schema: createZodIssueSchema(),
		}),
		500: createJson({
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
		200: createJson({
			description: "Login User with credentials",
			schema: createMessageSchema({
				description: "Message to show user is logged in",
				example: "User successfully logged in!",
			}),
		}),
		401: createJson({
			description: "Unauthorized User",
			schema: createErrorSchema().openapi({
				example: {
					code: "UNAUTHORIZED",
					message: "Unauthorized User",
					stack: "auth.handlers.login#001",
				},
			}),
		}),
		404: createJson({
			description: "User not found",
			schema: createErrorSchema().openapi({
				example: {
					code: "NOT_FOUND",
					message: "User not found",
					stack: "auth.handlers.login#001",
				},
			}),
		}),
		422: createJson({
			description: "Unprocessable Entity",
			schema: createZodIssueSchema(),
		}),
		500: createJson({
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
