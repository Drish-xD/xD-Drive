import { HTTP_STATUSES } from "@/constants";
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
		id: z.string().uuid().openapi({ description, example }),
	});
};

/**
 * Create a ID schema with description and example.
 */
export const createIdSchema = ({ description = "The ID of the item", example = 1 }: TDescriptionExample<number> = {}) => {
	return z.object({
		id: z.coerce.number().openapi({ description, example }),
	});
};

/**
 * Create a JSON schema for hono-openAPI docs.
 * @param schema - Zod schema to create JSON.
 * @param description - Description for the openAPI.
 * @returns JSON  schema.
 */
export const createJson = <T extends z.ZodType>({
	schema,
	description,
}: {
	schema: T;
	description: string;
}) => {
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
	const baseError = z.object({
		status: z.custom<StatusCode>().openapi({ description: "Error status code to trace the error.", example: example?.status ?? 500 }),
		statusText: z.custom<StatusCodeText>().openapi({ description: "Status text based on the status code.", example: example?.statusText ?? "INTERNAL_SERVER_ERROR" }),
		error: z.object({
			code: z.string().openapi({ description: "Traceable error code. - [route_path]@[function]#[unique_code]", example: example?.error?.code ?? "folder.file@function#001" }),
			message: z.string().openapi({ description: "Error message.", example: example?.error?.message ?? "Some message related to the error." }),
			stack: z
				.string()
				.optional()
				.openapi({ description: "Stack trace of the error.", example: example?.error?.stack ?? "xyz" }),
		}),
	});

	return extendedError ? baseError.extend({ error: baseError.shape.error.merge(extendedError) }) : baseError;
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
export const createErrorJson = <T extends z.AnyZodObject = z.SomeZodObject, R extends z.AnyZodObject | z.ZodArray<z.AnyZodObject> = z.SomeZodObject>(
	{
		status,
		message,
		customExample,
		extendedError,
		zodIssueSchema,
	}: { status: (typeof HTTP_STATUSES)[StatusCodeText]; message?: string; extendedError?: T; customExample?: TExample<T>["error"]; zodIssueSchema?: R } = {
		status: HTTP_STATUSES.INTERNAL_SERVER_ERROR,
	},
) => {
	const { CODE, KEY, PHRASE } = status;

	if (zodIssueSchema) {
		const { error } = zodIssueSchema.safeParse(zodIssueSchema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {});
		return createJson({
			description: message ?? PHRASE,
			schema: createErrorSchema({
				extendedError: z.object({
					issues: z.record(z.string(), z.string().array().optional()).openapi({ description: "Issues with the schema", example: error?.flatten()?.fieldErrors }),
					name: z.string().openapi({ example: error?.name }),
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
				},
			},
		}),
	});
};
