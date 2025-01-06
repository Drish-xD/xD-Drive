import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { createErrorSchema, createJson } from "./schema.helpers";
import type { StatusCode } from "./types";

export const createErrorResponse = (status: StatusCode): ResponseConfig => {
	return createJson({
		description: "",
		schema: createErrorSchema(),
	});
};

export const createRequestBody = () => {
  
}
