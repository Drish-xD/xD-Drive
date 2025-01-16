import { HTTP_STATUSES, MESSAGES } from "@/constants";
import type { AppRouteHandler } from "@/helpers/types";
import { HTTPException } from "hono/http-exception";
import type { TDeleteUserRoute, TUpdateUserRoute, TUserRoute, TUsersMeRoute, TUsersRoute } from "./users.routes";

/**
 * Current user details
 */
export const me: AppRouteHandler<TUsersMeRoute> = async (ctx) => {
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

/**
 * Get Users Listing
 */
export const users: AppRouteHandler<TUsersRoute> = async (ctx) => {
	const { filters, limit, order, page } = ctx.req.valid("param");
	
	const users = await ctx.var.db.query.users.findMany({
		columns: {
			passwordHash: false,
		},
	});

	return ctx.json({ data: [], meta: { limit, page, total: 0 } }, HTTP_STATUSES.OK.CODE);
};

/**
 * Get User Details
 */
export const user: AppRouteHandler<TUserRoute> = async (ctx) => {};

/**
 * Update User Details
 */
export const updateUser: AppRouteHandler<TUpdateUserRoute> = async (ctx) => {};

/**
 * Delete User
 */
export const deleteUser: AppRouteHandler<TDeleteUserRoute> = async (ctx) => {};
