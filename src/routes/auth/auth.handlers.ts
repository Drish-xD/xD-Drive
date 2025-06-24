import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { deleteCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { CONFIG, COOKIES } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { lower } from "@/db/lib";
import { users } from "@/db/schema";
import type { AppRouteHandler } from "@/helpers/types";
import { generateJwtTokens, setCookieOptions } from "./auth.helpers";
import type { TLoginRoute, TLogoutRoute, TRefreshTokenRoute, TRegisterRoute, TVerifyEmailRoute } from "./auth.routes";

/**
 * Register User
 */
export const register: AppRouteHandler<TRegisterRoute> = async (ctx) => {
	const { logger, db } = ctx.var;
	const { password, email, ...body } = ctx.req.valid("json");

	const checkUser = await db.query.users.findFirst({
		columns: { id: true },
		where: (users, fn) => fn.eq(lower(users.email), email.toLowerCase()),
	});
	logger.debug("auth.handlers@register#checkUser", { checkUser });

	if (checkUser) {
		logger.error("auth.handlers@register#alreadyExists", { email });
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "auth.handlers@register#001",
			message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
		});
	}

	const hashedPassword = await bcrypt.hash(password, CONFIG.SALT_ROUNDS);

	const [{ passwordHash, ...returningUser }] = await db
		.insert(users)
		.values({ email, passwordHash: hashedPassword, ...body })
		.returning();
	logger.debug("auth.handlers@register#created", { returningUser });

	return ctx.json(returningUser, HTTP_STATUSES.CREATED.CODE);
};

/**
 * Login User
 */
export const login: AppRouteHandler<TLoginRoute> = async (ctx) => {
	const { logger, db } = ctx.var;
	const { password, email } = ctx.req.valid("json");

	const checkUser = await db.query.users.findFirst({
		columns: { id: true, passwordHash: true },
		where: (users, fn) => fn.eq(lower(users.email), email.toLowerCase()),
	});
	logger.debug("auth.handlers@login#checkUser", { checkUser });

	if (!checkUser) {
		logger.error("auth.handlers@login#notFound", { email });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "auth.handlers@login#001",
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		});
	}

	const isValid = await bcrypt.compare(password, checkUser.passwordHash);
	logger.debug("auth.handlers@login#isValid", { isValid });

	if (!isValid) {
		logger.error("auth.handlers@login#invalidCredentials", { email });
		throw new HTTPException(HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE, {
			cause: "auth.handlers@login#002",
			message: MESSAGES.AUTH.INVALID_CREDENTIALS,
		});
	}

	const { accessToken, refreshToken } = await generateJwtTokens(checkUser.id);
	logger.debug("auth.handlers@login#tokensGenerated", { userId: checkUser.id });

	await setSignedCookie(ctx, COOKIES.ACCESS_TOKEN, accessToken, CONFIG.COOKIE_SECRET, setCookieOptions.accessToken);
	await setSignedCookie(ctx, COOKIES.REFRESH_TOKEN, refreshToken, CONFIG.COOKIE_SECRET, setCookieOptions.refreshToken);
	logger.debug("auth.handlers@login#cookiesSet", { userId: checkUser.id });

	return ctx.json(
		{
			message: MESSAGES.AUTH.LOGGED_IN,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Refresh Token
 */
export const refreshToken: AppRouteHandler<TRefreshTokenRoute> = async (ctx) => {
	const { logger, userData } = ctx.var;

	const { accessToken, refreshToken } = await generateJwtTokens(userData.id);
	logger.debug("auth.handlers@refreshToken#tokensGenerated", { userId: userData.id });

	await setSignedCookie(ctx, COOKIES.ACCESS_TOKEN, accessToken, CONFIG.COOKIE_SECRET, setCookieOptions.accessToken);
	await setSignedCookie(ctx, COOKIES.REFRESH_TOKEN, refreshToken, CONFIG.COOKIE_SECRET, setCookieOptions.refreshToken);
	logger.debug("auth.handlers@refreshToken#cookiesSet", { userId: userData.id });

	return ctx.json(
		{
			message: MESSAGES.AUTH.REFRESHED_TOKEN,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Logout User
 */
export const logout: AppRouteHandler<TLogoutRoute> = (ctx) => {
	const { logger } = ctx.var;

	deleteCookie(ctx, COOKIES.ACCESS_TOKEN);
	deleteCookie(ctx, COOKIES.REFRESH_TOKEN);
	logger.debug("auth.handlers@logout#cookiesDeleted");

	return ctx.json(
		{
			message: MESSAGES.AUTH.LOGGED_OUT,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Verify User Email
 */
export const verifyEmail: AppRouteHandler<TVerifyEmailRoute> = async (ctx) => {
	const { logger, db, userData } = ctx.var;

	if (userData?.emailVerifiedAt) {
		logger.error("auth.handlers@verifyEmail#alreadyVerified", { userId: userData.id });
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "auth.handlers@verifyEmail#001",
			message: MESSAGES.AUTH.USER_ALREADY_VERIFIED,
		});
	}

	await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userData.id));
	logger.debug("auth.handlers@verifyEmail#verified", { userId: userData.id });

	return ctx.json(
		{
			message: MESSAGES.AUTH.EMAIL_VERIFIED,
		},
		HTTP_STATUSES.OK.CODE,
	);
};
