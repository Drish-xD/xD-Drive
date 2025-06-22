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
		logger.trace({ path, requestId, status: "Initializing" }, "[Middleware] Verify access token");

		if (UNPROTECTED_ROUTES_REGEX.test(ctx.req.path)) {
			logger.trace({ path, requestId, status: "Skipped" }, "[Middleware] Verify access token");
			return await next();
		}

		logger.debug({ path, requestId, status: "Validating token" }, "[Middleware] Verify access token");
		await jwt({
			cookie: {
				key: COOKIES.ACCESS_TOKEN,
				secret: CONFIG.COOKIE_SECRET,
			},
			secret: CONFIG.JWT_SECRET,
		})(ctx, next);
	});

export const setUserDataFromAccessToken = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const {
			var: { logger, requestId },
			req: { path },
		} = ctx;
		logger.trace({ path, requestId, status: "Initializing" }, "[Middleware] Set user data");

		if (UNPROTECTED_ROUTES_REGEX.test(ctx.req.path)) {
			logger.trace({ path, requestId, status: "Skipped" }, "[Middleware] Set user data");
			return await next();
		}

		const userId = ctx.get("jwtPayload")?.id;

		if (!userId) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				cause: "auth.middleware@setUserData#001",
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
			});
		}

		const userData = await ctx.var.db.query.users.findFirst({
			columns: { passwordHash: false },
			where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
		});

		if (!userData?.id) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				cause: "auth.middleware@setUserData#002",
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
			});
		}

		logger.debug({ path, requestId, status: "Success", userId }, "[Middleware] Set user data");
		ctx.set("userData", userData);

		await next();
	});

export const verifyRefreshToken = () => jwt({ cookie: { key: COOKIES.REFRESH_TOKEN, secret: CONFIG.COOKIE_SECRET }, secret: CONFIG.JWT_REFRESH_SECRET });

export const setUserDataFromRefreshToken = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const {
			var: { logger, requestId },
			req: { path },
		} = ctx;
		logger.trace({ path, requestId, status: "Initializing" }, "[Middleware] Verify user from refresh token");
		const userId = ctx.get("jwtPayload")?.id;

		if (!userId) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				cause: "auth.middleware@verifyUserFromRefreshToken#001",
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
			});
		}

		const userData = await ctx.var.db.query.users.findFirst({
			columns: { passwordHash: false },
			where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
		});

		if (!userData?.id) {
			throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
				cause: "auth.middleware@verifyUserFromRefreshToken#002",
				message: MESSAGES.AUTH.INVALID_ACCESS_TOKEN,
			});
		}

		logger.debug({ path, requestId, status: "Success", userId }, "[Middleware] Verify user from refresh token");
		ctx.set("userData", userData);

		await next();
	});
