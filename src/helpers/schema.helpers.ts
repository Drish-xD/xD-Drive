import type { JSONSchemaMeta } from "zod/v4/core";
import { HTTP_STATUSES } from "@/constants";
import { z } from "@/db/lib";
import type { StatusCode, StatusCodeText, TExample } from "./types";

/**
 * Create a message schema with description and example.
 */
export const createMessageSchema = (metaOptions: JSONSchemaMeta = { description: "The message to return", example: "Hello world!" }) => {
	return z.object({
		message: z.string().meta(metaOptions),
	});
};

/**
 * Create a UUID schema with description and example.
 */
export const createUuidSchema = (metaOptions: JSONSchemaMeta = { description: "The UUID of the item", example: "123e4567-e89b-12d3-a456-426614174000" }) => {
	return z.object({
		id: z.uuid().meta(metaOptions),
	});
};

/**
 * Create a ID schema with description and example.
 */
export const createIdSchema = (metaOptions: JSONSchemaMeta = { description: "The ID of the item", example: 1 }) => {
	return z.object({
		id: z.coerce.number().meta(metaOptions),
	});
};

/**
 * Create a JSON schema for hono-openAPI docs.
 * @param schema - Zod schema to create JSON.
 * @param description - Description for the openAPI.
 * @returns schema.
 */
export const createJson = <T extends z.ZodType>({ schema, description }: { schema: T; description: string }) => {
	return {
		description,
		content: {
			"application/json": {
				schema,
			},
		},
	};
};

/**
 * Create a Multi-Part Form schema for hono-openAPI docs.
 * @param schema - Zod schema to create JSON.
 * @param description - Description for the openAPI.
 * @returns schema.
 */
export const createMultiPartForm = <T extends z.ZodType>({ schema, description }: { schema: T; description: string }) => {
	return {
		description,
		content: {
			"multipart/form-data": {
				schema: schema,
			},
		},
	};
};

/**
 * Create a JSON schema for error response.
 * @param extendedError - Extended error schema.
 * @param example - Example for the error schema.
 * @returns JSON schema.
 */
export const createErrorSchema = <T extends z.ZodObject = z.ZodObject>({ example, extendedError }: { extendedError?: T; example?: TExample<T> } = {}) => {
	const baseError = z.object({
		code: z.string().meta({
			description: "Traceable error code. - [route_path]@[function]#[unique_code]",
			example: example?.error?.code ?? "folder.file@function#001",
		}),
		message: z.string().meta({
			description: "Error message.",
			example: example?.error?.message ?? "Some message related to the error.",
		}),
		stack: z
			.string()
			.optional()
			.meta({ description: "Stack trace of the error.", example: example?.error?.stack ?? "xyz" }),
	});

	const standardError = z.object({
		status: z.number().meta({ description: "Error status code to trace the error.", example: example?.status ?? 500 }),
		statusText: z.string().meta({
			description: "Status text based on the status code.",
			example: example?.statusText ?? "INTERNAL_SERVER_ERROR",
		}),
	});

	return extendedError?.shape
		? standardError.extend({
				error: z.intersection(baseError, extendedError),
			})
		: standardError.extend({
				error: baseError,
			});
};

/**
 * Create a JSON schema for error response.
 * @param status - HTTP status code.
 * @param message - Error message.
 * @param customExample - Custom example for the error.
 * @param zodIssueSchema - Zod schema for the error.
 * @param extendedError - Extended error schema.
 * @returns OpenAPI JSON schema.
 */
export const createErrorJson = <T extends z.ZodObject = z.ZodObject, R extends z.ZodObject | z.ZodArray<z.ZodObject> = z.ZodObject>(
	{
		status,
		message,
		customExample,
		extendedError,
		zodIssueSchema,
	}: {
		status: (typeof HTTP_STATUSES)[StatusCodeText];
		message?: string;
		extendedError?: T;
		customExample?: TExample<T>["error"];
		zodIssueSchema?: R;
	} = {
		status: HTTP_STATUSES.INTERNAL_SERVER_ERROR,
	},
) => {
	const { CODE, KEY, PHRASE } = status;

	if (zodIssueSchema) {
		const { error } = zodIssueSchema.safeParse(zodIssueSchema instanceof z.ZodArray ? [] : {});
		// @ts-expect-error - ZodError<Record<string, unknown>> | ZodError<Record<string, unknown>[]>
		const flattenedError = error ? z.flattenError(error) : null;

		return createJson({
			description: message ?? PHRASE,
			schema: createErrorSchema({
				extendedError: z.object({
					issues: z.record(z.string(), z.string().array().optional()).meta({
						description: "Issues with the schema",
						example: flattenedError?.fieldErrors,
					}),
					name: z.string().meta({ example: error?.name }),
				}),
				example: {
					status: CODE as StatusCode,
					statusText: KEY,
					error: {
						message: message ?? PHRASE,
						...customExample,
					},
				},
			}),
		});
	}

	return createJson({
		description: message ?? PHRASE,
		schema: createErrorSchema({
			extendedError,
			example: {
				status: CODE as StatusCode,
				statusText: KEY,
				error: {
					message: message ?? PHRASE,
					...customExample,
				} as TExample<T>["error"],
			},
		}),
	});
};
