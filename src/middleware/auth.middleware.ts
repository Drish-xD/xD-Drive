import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { CONFIG, COOKIES, UNPROTECTED_ROUTES_REGEX } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import type { AppBindings } from "@/helpers/types";

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
		await jwt({
			secret: CONFIG.JWT_SECRET,
			cookie: {
				key: COOKIES.ACCESS_TOKEN,
				secret: CONFIG.COOKIE_SECRET,
			},
		})(ctx, next);
	});

export const setUserDataFromAccessToken = () =>
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
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware@setUserData#001",
			});
		}

		const userData = await ctx.var.db.query.users.findFirst({
			where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
			columns: { passwordHash: false },
		});

		if (!userData?.id) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware@setUserData#002",
			});
		}

		logger.debug({ requestId, path, userId, status: "Success" }, "[Middleware] Set user data");
		ctx.set("userData", userData);

		await next();
	});

export const verifyRefreshToken = () => jwt({ secret: CONFIG.JWT_REFRESH_SECRET, cookie: { key: COOKIES.REFRESH_TOKEN, secret: CONFIG.COOKIE_SECRET } });

export const setUserDataFromRefreshToken = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const {
			var: { logger, requestId },
			req: { path },
		} = ctx;
		logger.trace({ requestId, path, status: "Initializing" }, "[Middleware] Verify user from refresh token");
		const userId = ctx.get("jwtPayload")?.id;

		if (!userId) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware@verifyUserFromRefreshToken#001",
			});
		}

		const userData = await ctx.var.db.query.users.findFirst({
			where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
			columns: { passwordHash: false },
		});

		if (!userData?.id) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
				cause: "auth.middleware@verifyUserFromRefreshToken#002",
			});
		}

		logger.debug({ requestId, path, userId, status: "Success" }, "[Middleware] Verify user from refresh token");
		ctx.set("userData", userData);

		await next();
	});
