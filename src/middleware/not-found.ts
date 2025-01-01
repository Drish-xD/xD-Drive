import { HTTP_STATUSES } from "@/constants";
import type { TError } from "@/helpers/types";
import type { NotFoundHandler } from "hono";
import type { z } from "zod";

type TNotFoundError = TError<z.ZodObject<{ path: z.ZodString; method: z.ZodString }>>;

export const notFound: NotFoundHandler = (ctx) => {
	return ctx.json<TNotFoundError>({
		code: HTTP_STATUSES.NOT_FOUND.KEY,
		message: HTTP_STATUSES.NOT_FOUND.PHRASE,
		details: {
			path: ctx.req.path,
			method: ctx.req.method,
		},
	});
};
