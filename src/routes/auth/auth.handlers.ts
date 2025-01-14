import { Config } from "@/config";
import { COOKIES, HTTP_STATUSES, MESSAGES } from "@/constants";
import { users } from "@/db/schema";
import type { AppBindings, AppRouteHandler } from "@/helpers/types";
import type { RouteHandler } from "@hono/zod-openapi";
import * as bcrypt from "bcryptjs";
import { addWeeks, endOfWeek, startOfToday } from "date-fns";
import { setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import type { TLoginRoute, TRegisterRoute } from "./auth.routes";

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

	const hashedPassword = await bcrypt.hash(password, Config.SALT_ROUNDS);

	const [{ passwordHash, ...returningUser }] = await ctx.var.db
		.insert(users)
		.values({ email, passwordHash: hashedPassword, ...body })
		.returning();

	return ctx.json(returningUser, HTTP_STATUSES.OK.CODE);
};

/**
 * Login User
 */
export const login: RouteHandler<TLoginRoute, AppBindings> = async (ctx) => {
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

	const jwtToken = await sign({ id: checkUser?.id }, Config.JWT_SECRET);
	
	ctx.var.logger.info(`User ${checkUser.id} logged in with token: ${jwtToken}`);

	await setSignedCookie(ctx, COOKIES.ACCESS_TOKEN, jwtToken, Config.COOKIE_SECRET, {
		path: "/",
		// secure: true,
		// domain: Config.IsProd ? "" : "localhost",
		// httpOnly: Config.IsProd ? true : false,
		maxAge: 1000, // 1 second
		expires: addWeeks(startOfToday(), 1),
		sameSite: "Strict",
	});

	return ctx.json(
		{
			message: MESSAGES.AUTH.LOGGED_IN,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

// app.post("/login", async (ctx) => {
// 	return ctx.text("login");
// });

// app.post("/refresh-token", async (ctx) => {
// 	return ctx.text("refresh-token");
// });

// app.post("/logout", async (ctx) => {
// 	return ctx.text("logout");
// });

// app.post("/forgot-password", async (ctx) => {
// 	return ctx.text("forgot-password");
// });

// app.post("/reset-password", async (ctx) => {
// 	return ctx.text("reset-password");
// });
