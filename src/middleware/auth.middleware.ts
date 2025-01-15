import { CONFIG } from "@/config";
import { COOKIES } from "@/constants";
import type { AppBindings } from "@/helpers/types";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

export const verifyAuth = () =>
	createMiddleware(async (ctx, next) => {
		const regex = /^\/(auth|docs|health)|^\/$/;

		if (regex.test(ctx.req.path)) {
			return await next();
		}

		await jwt({ secret: CONFIG.JWT_SECRET, cookie: { key: COOKIES.ACCESS_TOKEN, secret: CONFIG.COOKIE_SECRET } })(ctx, next);
	});

export const setUserData = () =>
	createMiddleware<AppBindings>(async (ctx, next) => {
		const userId = ctx.get("jwtPayload")?.id;

		if (!userId) {
			ctx.set("userData", null);
			return await next();
		}

		const userData = await ctx.var.db.query.users.findFirst({
			where: (users, fn) => fn.eq(users.id, userId),
		});

		if (!userData) {
			ctx.set("userData", null);
			return await next();
		}

		ctx.set("userData", userData);

		await next();
	});
