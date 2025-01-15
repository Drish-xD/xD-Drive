import { HTTP_STATUSES } from "@/constants";
import type { TError } from "@/helpers/types";
import type { NotFoundHandler } from "hono";
import type { z } from "zod";

type TNotFoundError = TError<z.ZodObject<{ path: z.ZodString; method: z.ZodString }>>;

export const notFound: NotFoundHandler = (ctx) => {
	return ctx.json<TNotFoundError>({
		status: HTTP_STATUSES.NOT_FOUND.CODE,
		statusText: HTTP_STATUSES.NOT_FOUND.KEY,
		error: {
			code: "middleware@notFound#001",
			message: HTTP_STATUSES.NOT_FOUND.PHRASE,
			method: ctx.req.method,
			path: ctx.req.path,
		},
	});
};
