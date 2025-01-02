import { HTTP_STATUSES } from "@/constants";
import { z } from "@hono/zod-openapi";
import type { CreateErrorSchema, HTTP_STATUS_CODE, TExample } from "./types";

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
export const createJson = <T extends z.ZodType<unknown>>({ description, schema, required }: { schema: T; description: string; required?: true }) => {
	return {
		content: {
			"application/json": {
				schema,
			},
		},
		description,
	};
};

export const createErrorSchema: CreateErrorSchema = <T extends z.ZodType<unknown> = z.ZodUnknown>({
	detailsSchema,
	example,
}: { detailsSchema?: T; example?: TExample<T> } = {}) => {
	const details =
		detailsSchema ??
		z
			.unknown()
			.optional()
			.openapi({
				description: "Additional details about the error, like Zod validation issues.",
				example: example?.details ?? "DB connection failed",
			});

	return z.object({
		code: z.enum(Object.keys(HTTP_STATUSES) as unknown as readonly [HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]).openapi({
			description: "Error status code to trace the error.",
			example: example?.code ?? "INTERNAL_SERVER_ERROR",
		}),
		message: z.string().openapi({
			description: "Human-readable error message.",
			example: example?.message ?? "Something went wrong. Please try again later.",
		}),
		stack: z
			.string()
			.optional()
			.openapi({
				description: "Stack trace of the error.",
				example: example?.stack ?? "Error: Something went wrong.\n    at /path/to/file.ts:10:20",
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
		return createErrorSchema({
			detailsSchema: issueSchema,
			example: {
				code: "UNPROCESSABLE_ENTITY",
				message: "Validation failed",
			},
		});
	}

	const { error: example } = schema.safeParse(schema instanceof z.ZodArray ? [] : {});

	return createErrorSchema({
		detailsSchema: issueSchema.openapi({ example }),
		example: {
			code: "UNPROCESSABLE_ENTITY",
			message: "Validation failed",
		},
	});
};
