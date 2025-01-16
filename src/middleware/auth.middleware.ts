import { CONFIG, COOKIES, UNPROTECTED_ROUTES_REGEX } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import type { AppBindings } from "@/helpers/types";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

export const verifyAccessToken = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const {
			var: { logger, requestId },
			req: { path },
		} = ctx;
		logger.trace({ requestId, path, status: "Initializing" }, "[Middleware] Verify access token");

		if (UNPROTECTED_ROUTES_REGEX.test(ctx.req.path)) {
			logger.trace({ requestId, path, status: "Skipped" }, "[Middleware] Verify access token");
			return await next();
		}

		logger.debug({ requestId, path, status: "Validating token" }, "[Middleware] Verify access token");
		await jwt({ secret: CONFIG.JWT_SECRET, cookie: { key: COOKIES.ACCESS_TOKEN, secret: CONFIG.COOKIE_SECRET } })(ctx, next);
	});

export const setUserData = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const {
			var: { logger, requestId },
			req: { path },
		} = ctx;
		logger.trace({ requestId, path, status: "Initializing" }, "[Middleware] Set user data");

		if (UNPROTECTED_ROUTES_REGEX.test(ctx.req.path)) {
			logger.trace({ requestId, path, status: "Skipped" }, "[Middleware] Set user data");
			return await next();
		}

		const userId = ctx.get("jwtPayload")?.id;

		if (!userId) {
			logger.trace({ requestId, path, status: "Failed", message: "Missing user id", cause: "auth.middleware.setUserData#001" }, "[Middleware] Set user data");
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware.setUserData#001",
			});
		}

		const userData = await ctx.var.db.query.users.findFirst({
			where: (users, fn) => fn.eq(users.id, userId),
		});

		if (!userData) {
			logger.trace({ requestId, path, status: "Failed", message: "User not found", cause: "auth.middleware.setUserData#002" }, "[Middleware] Set user data");
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware.setUserData#001",
			});
		}

		logger.debug({ requestId, path, userId, status: "Success" }, "[Middleware] Set user data");
		ctx.set("userData", userData);

		await next();
	});

export const verifyRefreshToken = () => jwt({ secret: CONFIG.JWT_REFRESH_SECRET, cookie: { key: COOKIES.REFRESH_TOKEN, secret: CONFIG.COOKIE_SECRET } });
