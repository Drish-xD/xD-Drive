import { HTTP_STATUSES, MESSAGES } from "@/constants";
import type { AppBindings } from "@/helpers/types";
import type { RouteHandler } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { TUsersMeRoute } from "./users.routes";

/**
 * Login User
 */
export const me: RouteHandler<TUsersMeRoute, AppBindings> = async (ctx) => {
	const userId = ctx.get("userData")?.id;

	if (!userId) {
		throw new HTTPException(HTTP_STATUSES.UNAUTHORIZED.CODE, {
			message: MESSAGES.AUTH.UNAUTHORIZED,
			cause: "users.handlers@me#001",
		});
	}

	const userDetials = await ctx.var.db.query.users.findFirst({
		where: (users, fn) => fn.eq(users.id, userId),
		columns: {
			passwordHash: false,
		},
	});

	return ctx.json(userDetials, HTTP_STATUSES.OK.CODE);
};
