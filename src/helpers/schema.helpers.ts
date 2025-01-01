import { HTTP_STATUSES } from "@/constants";
import { z } from "@hono/zod-openapi";
import type { HTTP_STATUS_CODE, ZodSchema } from "./types";

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
 * Create a JSON schema for hono-openAPI docs.
 * @param schema - Zod schema to create JSON.
 * @param description - Description for the openAPI.
 * @returns JSON  schema.
 */
export const createJson = <T extends ZodSchema>({ description, schema, required }: { schema: T; description: string; required?: true }) => {
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
type CreateErrorSchema = {
	(): z.ZodObject<{
		code: z.ZodEnum<[HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]>;
		message: z.ZodString;
		stack: z.ZodOptional<z.ZodString>;
		details: z.ZodUnknown;
	}>;
	<T extends ZodSchema>(
		details: T,
	): z.ZodObject<{
		code: z.ZodEnum<[HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]>;
		message: z.ZodString;
		stack: z.ZodOptional<z.ZodString>;
		details: T;
	}>;
};

export const createErrorSchema: CreateErrorSchema = <T extends ZodSchema>(detailsSchema?: T) => {
	const details =
		detailsSchema ??
		z.unknown().optional().openapi({
			description: "Additional details about the error, like Zod validation issues.",
			example: "DB connection failed",
		});

	return z.object({
		code: z.enum(Object.keys(HTTP_STATUSES) as unknown as readonly [HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]).openapi({
			description: "Error status code to trace the error.",
			example: HTTP_STATUSES.INTERNAL_SERVER_ERROR.KEY,
		}),
		message: z.string().openapi({
			description: "Human-readable error message.",
			example: "Something went wrong. Please try again later.",
		}),
		stack: z.string().optional().openapi({
			description: "Stack trace of the error.",
			example: "Error: Something went wrong.\n    at /path/to/file.ts:10:20",
		}),
		details,
	});
};

/**
 * Create a JSON schema for error response.
 */
export const createZodIssueSchema = <T extends z.ZodSchema>(schema?: T) => {
	const issueSchema = z.object({
		issues: z.array(
			z.object({
				code: z.string(),
				path: z.array(z.union([z.string(), z.number()])),
				message: z.string().optional(),
			}),
		),
		name: z.string(),
	});

	if (!schema) {
		return createErrorSchema(issueSchema);
	}

	const { error: example } = schema.safeParse(schema instanceof z.ZodArray ? [] : {});

	return createErrorSchema(issueSchema.openapi({ example }));
};
