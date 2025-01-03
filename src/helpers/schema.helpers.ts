import { z } from "@hono/zod-openapi";
import { BaseErrorSchema, BaseSchema, type TDescriptionExample, type TExample } from "./types";

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
 * Create a JSON schema for hono-openAPI docs.
 * @param schema - Zod schema to create JSON.
 * @param description - Description for the openAPI.
 * @returns JSON  schema.
 */
export const createJson = <T extends z.ZodType<unknown>>({ description, schema }: { schema: T; description: string }) => {
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
 * Create a JSON schema for error response.
 * @param extendedError - Extended error schema.
 * @param example - Example for the error schema.
 * @returns JSON schema.
 */
export const createErrorSchema = <T extends z.AnyZodObject = z.SomeZodObject>({ example, extendedError }: { extendedError?: T; example?: TExample<T> } = {}) => {
	return BaseSchema.openapi({
		example: {
			status: example?.status ?? 500,
			statusText: example?.statusText ?? "INTERNAL_SERVER_ERROR",
		},
	}).extend({
		error: BaseErrorSchema.openapi({
			example: {
				code: example?.error?.code ?? "auth.handlers@register#001",
				message: example?.error?.message ?? "Something went wrong.",
				stack: example?.error?.stack ?? "Error: Something went wrong.\n    at /path/to/file.ts:10:20",
			},
		}).merge(extendedError ?? z.object({}).strict()),
	});
};

type t = z.infer<ReturnType<typeof createErrorSchema>>;
