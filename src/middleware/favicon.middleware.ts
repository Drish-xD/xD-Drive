import type { MiddlewareHandler } from "hono";

/**
 * Serve a favicon with an emoji
 * @param emoji  The emoji to use in the favicon
 * @returns The middleware handler
 */
export const serveFavicon = (emoji: string): MiddlewareHandler => {
	return async (ctx, next) => {
		if (ctx.req.path === "/favicon.ico") {
			ctx.header("Content-Type", "image/svg+xml");
			return ctx.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" x="-0.1em" font-size="90">${emoji}</text></svg>`);
		}
		return next();
	};
};
