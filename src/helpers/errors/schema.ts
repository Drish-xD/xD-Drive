import { HTTP_STATUSES } from "@/constants";
import { z } from "@hono/zod-openapi";

type HTTP_STATUS_CODE = keyof typeof HTTP_STATUSES | (string & {});
const StatusCode: z.ZodType<HTTP_STATUS_CODE> = z.enum(Object.keys(HTTP_STATUSES) as unknown as readonly [HTTP_STATUS_CODE, ...HTTP_STATUS_CODE[]]);

/**
 * Zod Schema for the default error response structure.
 */
export const ErrorSchema = z
	.object({
		code: StatusCode.openapi({
			example: "ACCEPTED",
			description: "Error status code to trace the error.",
		}),
		message: z.string().openapi({
			description: "Human-readable error message.",
			example: "User not found.",
		}),
		details: z
			.unknown()
			.optional()
			.openapi({
				description: "Additional details about the error.",
				example: { userId: 1 },
			}),
		stack: z.string().optional().openapi({
			description: "Stack trace of the error.",
			example: "Error: User not found at /api/v1/users/1",
		}),
	})
	.describe("Default error response structure.");

export type TError<T = unknown> = z.infer<typeof ErrorSchema> & {
	details?: T;
};
