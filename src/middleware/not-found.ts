import { HTTP_STATUS_CODES, HTTP_STATUS_PHRASES } from "@/constants";
import type { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = (ctx) => {
	return ctx.json({
		code: HTTP_STATUS_CODES.NOT_FOUND,
		message: HTTP_STATUS_PHRASES.NOT_FOUND,
		path: ctx.req.routePath,
	});
};
