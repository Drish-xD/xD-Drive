import { HTTP_STATUSES } from "@/constants";
import type { RouteConfig } from "@hono/zod-openapi";
import { ErrorSchema } from "./schema";

/**
 * OpenAPI error responses for common HTTP status codes.
 */
export const openApiErrorResponses: RouteConfig["responses"] = {
	[HTTP_STATUSES.BAD_REQUEST.CODE]: {
		description: "The server cannot process the request due to client-side issues, such as malformed syntax, invalid input, or exceeding size limits.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.BAD_REQUEST.KEY),
			},
		},
	},
	[HTTP_STATUSES.UNAUTHORIZED.CODE]: {
		description: "Authentication is required for accessing the requested resource. Please provide valid credentials.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.UNAUTHORIZED.KEY),
			},
		},
	},
	[HTTP_STATUSES.FORBIDDEN.CODE]: {
		description: "You do not have the necessary permissions to access this resource. Please contact the administrator if you believe this is an error.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.FORBIDDEN.KEY),
			},
		},
	},
	[HTTP_STATUSES.NOT_FOUND.CODE]: {
		description: "The requested resource could not be found on the server. Please check the URL or resource identifier.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.NOT_FOUND.KEY),
			},
		},
	},
	[HTTP_STATUSES.CONFLICT.CODE]: {
		description: "The request could not be processed due to a conflict, such as a duplicate resource or unique constraint violation.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.CONFLICT.KEY),
			},
		},
	},
	[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: {
		description: "An unexpected error occurred on the server. Please try again later or contact support if the issue persists.",
		content: {
			"application/json": {
				schema: ErrorSchema.openapi(HTTP_STATUSES.INTERNAL_SERVER_ERROR.KEY),
			},
		},
	},
};
