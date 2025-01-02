import { Config } from "@/config";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { users } from "@/db/schema";
import type { AppBindings, AppRouteHandler } from "@/helpers/types";
import type { RouteHandler } from "@hono/zod-openapi";
import * as bcrypt from "bcryptjs";
import type { TLoginRoute, TRegisterRoute } from "./auth.routes";

export const register: AppRouteHandler<TRegisterRoute> = async (ctx) => {
	const { password, email, ...body } = ctx.req.valid("json");

	const checkUser = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(users.email, email),
		columns: { id: true },
	});

	if (checkUser) {
		return ctx.json(
			{
				message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
				code: HTTP_STATUSES.CONFLICT.KEY,
				details: {
					userId: checkUser.id,
				},
				stack: "auth.handlers.register#001",
			},
			HTTP_STATUSES.CONFLICT.CODE,
		);
	}

	const hashedPassword = await bcrypt.hash(password, Config.SALT_ROUNDS);

	const [{ passwordHash, ...returningUser }] = await ctx.var.db
		.insert(users)
		.values({ email, passwordHash: hashedPassword, ...body })
		.returning();

	return ctx.json(returningUser, HTTP_STATUSES.OK.CODE);
};

export const login: RouteHandler<TLoginRoute, AppBindings> = async (ctx) => {
	const { password, email } = ctx.req.valid("json");

	const checkUser = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(users.email, email),
		columns: { passwordHash: true },
	});

	if (!checkUser) {
		// throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
		// 	message: MESSAGES.AUTH.USER_NOT_FOUND,
		// 	cause: "auth.handlers.login#001",
		// });

		return ctx.json(
			{
				message: MESSAGES.AUTH.USER_NOT_FOUND,
				code: HTTP_STATUSES.NOT_FOUND.KEY,
				stack: "auth.handlers.login#001",
			},
			HTTP_STATUSES.NOT_FOUND.CODE,
		);
	}

	const isValid = await bcrypt.compare(password, checkUser.passwordHash);

	if (!isValid) {
		return ctx.json(
			{
				message: MESSAGES.AUTH.INVALID_CREDENTIALS,
				code: HTTP_STATUSES.UNPROCESSABLE_ENTITY.KEY,
				stack: "auth.handlers.login#002",
				details: {
					issues: [],
					name: "ValidationError",
				},
			},
			HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE,
		);
	}

	return ctx.json(
		{
			message: "User successfully logged in!",
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
