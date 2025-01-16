import { CONFIG, COOKIES } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { users } from "@/db/schema";
import type { AppRouteHandler } from "@/helpers/types";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { deleteCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { generateJwtTokens, setCookieOptions } from "./auth.helpers";
import type { TForgotPasswordRoute, TLoginRoute, TLogoutRoute, TRefreshTokenRoute, TRegisterRoute, TResetPasswordRoute, TVerifyEmailRoute } from "./auth.routes";

/**
 * Register User
 */
export const register: AppRouteHandler<TRegisterRoute> = async (ctx) => {
	const { password, email, ...body } = ctx.req.valid("json");

	const checkUser = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(users.email, email),
		columns: { id: true },
	});

	if (checkUser) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "auth.handlers.register#001",
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

	const checkUser = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(users.email, email),
		columns: { passwordHash: true, id: true },
	});

	if (!checkUser) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			cause: "auth.handlers.login#001",
		});
	}

	const isValid = await bcrypt.compare(password, checkUser.passwordHash);

	if (!isValid) {
		throw new HTTPException(HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE, {
			message: MESSAGES.AUTH.INVALID_CREDENTIALS,
			cause: "auth.handlers.login#002",
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
	const payload = ctx.get("jwtPayload");

	if (!payload?.id) {
		throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
			message: MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
			cause: "auth.handlers.refreshToken#001",
		});
	}

	const { accessToken, refreshToken } = await generateJwtTokens(payload?.id);

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
			cause: "auth.handlers.verifyEmail#001",
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

/**
 * Forgot User Password
 */
export const forgotPassword: AppRouteHandler<TForgotPasswordRoute> = (ctx) => {
	// TODO: TO BE IMPLEMENTED
	return ctx.json(
		{
			message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Reset User Password
 */
export const resetPassword: AppRouteHandler<TResetPasswordRoute> = (ctx) => {
	// TODO: TO BE IMPLEMENTED
	return ctx.json(
		{
			message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};
