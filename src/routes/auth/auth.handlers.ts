import { CONFIG, COOKIES } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { lower } from "@/db/lib";
import { users } from "@/db/schema";
import type { AppRouteHandler } from "@/helpers/types";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { deleteCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { generateJwtTokens, setCookieOptions } from "./auth.helpers";
import type { TLoginRoute, TLogoutRoute, TRefreshTokenRoute, TRegisterRoute, TVerifyEmailRoute } from "./auth.routes";

/**
 * Register User
 */
export const register: AppRouteHandler<TRegisterRoute> = async (ctx) => {
	const { password, email, ...body } = ctx.req.valid("json");

	const checkUser = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(lower(users.email), email.toLowerCase()),
		columns: { id: true },
	});

	if (checkUser) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "auth.handlers@register#001",
			message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
		});
	}

	const hashedPassword = await bcrypt.hash(password, CONFIG.SALT_ROUNDS);

	const [{ passwordHash, ...returningUser }] = await ctx.var.db
		.insert(users)
		.values({ email, passwordHash: hashedPassword, ...body })
		.returning();

	return ctx.json(returningUser, HTTP_STATUSES.OK.CODE);
};

/**
 * Login User
 */
export const login: AppRouteHandler<TLoginRoute> = async (ctx) => {
	const { password, email } = ctx.req.valid("json");
	const db = ctx.get("db");

	const checkUser = await db.query.users.findFirst({
		where: (users, fn) => fn.eq(lower(users.email), email.toLowerCase()),
		columns: { passwordHash: true, id: true },
	});

	if (!checkUser) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			cause: "auth.handlers@login#001",
		});
	}

	const isValid = await bcrypt.compare(password, checkUser.passwordHash);

	if (!isValid) {
		throw new HTTPException(HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE, {
			message: MESSAGES.AUTH.INVALID_CREDENTIALS,
			cause: "auth.handlers@login#002",
		});
	}

	const { accessToken, refreshToken } = await generateJwtTokens(checkUser.id);

	await setSignedCookie(ctx, COOKIES.ACCESS_TOKEN, accessToken, CONFIG.COOKIE_SECRET, setCookieOptions.accessToken);
	await setSignedCookie(ctx, COOKIES.REFRESH_TOKEN, refreshToken, CONFIG.COOKIE_SECRET, setCookieOptions.refreshToken);

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
	const userDetails = ctx.get("userData");

	const { accessToken, refreshToken } = await generateJwtTokens(userDetails.id);

	await setSignedCookie(ctx, COOKIES.ACCESS_TOKEN, accessToken, CONFIG.COOKIE_SECRET, setCookieOptions.accessToken);
	await setSignedCookie(ctx, COOKIES.REFRESH_TOKEN, refreshToken, CONFIG.COOKIE_SECRET, setCookieOptions.refreshToken);

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
	deleteCookie(ctx, COOKIES.ACCESS_TOKEN);
	deleteCookie(ctx, COOKIES.REFRESH_TOKEN);

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
	const userData = ctx.get("userData");
	if (userData?.emailVerifiedAt) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			message: MESSAGES.AUTH.USER_ALREADY_VERIFIED,
			cause: "auth.handlers@verifyEmail#001",
		});
	}

	await ctx.var.db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userData.id));

	return ctx.json(
		{
			message: MESSAGES.AUTH.EMAIL_VERIFIED,
		},
		HTTP_STATUSES.OK.CODE,
	);
};
