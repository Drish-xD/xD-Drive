import { HTTP_STATUSES } from "@/constants";
import { type RouteConfig, z } from "@hono/zod-openapi";
import type { ZodSchema } from "zod";
import type { HTTP_STATUS_CODE } from "./types";

type TDescriptionExample = { description?: string; example?: string };

/**
 * Create a message schema with description and example.
 */
export const createMessageSchema = ({ description = "The message to return", example = "Hello world!" }: TDescriptionExample = {}) => {
	return z.object({
		message: z.string().openapi({ description, example }),
	});
};

/**
 * Create a UUID schema with description and example.
 */
export const createUuidSchema = ({ description = "The UUID of the item", example = "1" }: TDescriptionExample = {}) => {
	return z.object({
		uuid: z.string().uuid().openapi({ description, example }),
	});
};

/**
 * Create a ID schema with description and example.
 */
export const createIdSchema = ({ description = "The ID of the item", example = "1" }: TDescriptionExample) => {
	return z.object({
		id: z.string().openapi({ description, example }),
	});
};

/**
 * Create a JSON response schema for hono-openAPI docs.
 */
export const createJsonRes = <T extends ZodSchema>({ description, schema }: { schema: T; description: string }): RouteConfig["responses"][number] => {
	return {
		content: {
			"application/json": {
				schema,
			},
		},
		description,
	};
};

/**
 * Error schema to return in case of an error.
 */
export const createErrorSchema = () => {
	return z.object({
		code: z.enum(Object.keys(HTTP_STATUSES) as unknown as readonly [HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]).openapi({
			example: HTTP_STATUSES.INTERNAL_SERVER_ERROR.KEY,
			description: "Error status code to trace the error.",
		}),
		message: z.string().openapi({
			description: "Human-readable error message.",
			example: "Something went wrong. Please try again later.",
		}),
		details: z.unknown().optional().openapi({
			description: "Additional details about the error. Like Zod validation issues, etc.",
			example: "DB connection failed",
		}),
		stack: z.string().optional().openapi({
			description: "Stack trace of the error.",
			example: "Error: Something went wrong.\n    at /path/to/file.ts:10:20",
		}),
	});
};
