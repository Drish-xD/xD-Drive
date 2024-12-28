import { CODES, PHRASES } from "@/constants";
import type { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = (ctx) => {
	return ctx.json({
		code: CODES.COMMON_CODE.NOT_FOUND,
		message: PHRASES.COMMON_PHRASES.NOT_FOUND,
		path: ctx.req.routePath,
	});
};
