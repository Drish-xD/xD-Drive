import { z } from "@hono/zod-openapi";
import type { StatusCode, StatusCodeText, TDescriptionExample, TExample } from "./types";

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
	return z.object({
		status: z.custom<StatusCode>().openapi({ description: "Error status code to trace the error.", example: example?.status ?? 500 }),
		statusText: z.custom<StatusCodeText>().openapi({ description: "Status text based on the status code.", example: example?.statusText ?? "INTERNAL_SERVER_ERROR" }),
		error: z
			.object({
				code: z.string().openapi({ description: "Traceable error code. - [route_path]@[function]#[unique_code]", example: example?.error?.code ?? "folder.file@function#001" }),
				message: z.string().openapi({ description: "Error message.", example: example?.error?.message ?? "Some error has occured." }),
				stack: z
					.string()
					.optional()
					.openapi({ description: "Stack trace of the error.", example: example?.error?.stack ?? "" }),
			})
			.merge(extendedError ?? z.object({}).strict()),
	});
};
