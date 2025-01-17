import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { users as usersTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder, whereQueryBuilder } from "@/helpers/pagination.helpers";
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
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	const orderBy = orderByQueryBuilder(order);
	// const where = whereQueryBuilder(filters);

	const [usersListing, totalCount] = await Promise.all([
		ctx.var.db.query.users.findMany({
			columns: { passwordHash: false },
			limit,
			offset,
			orderBy,
			// where: (users, fn) => where(users, fn),
		}),
		totalCountQueryBuilder(usersTable, includeTotal),
	]);

	const pageCount = Math.ceil((totalCount ?? usersListing.length) / limit);

	return ctx.json(
		{
			meta: {
				currentPage: page,
				startIndex: offset,
				itemsPerPage: limit,
				totalCount: totalCount,
				pageCount: pageCount,
				sortOrder: order,
				appliedFilters: filters,
			},
			data: usersListing,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

// /**
//  * Get User Details
//  */
// export const user: AppRouteHandler<TUserRoute> = async (ctx) => {};

// /**
//  * Update User Details
//  */
// export const updateUser: AppRouteHandler<TUpdateUserRoute> = async (ctx) => {};

// /**
//  * Delete User
//  */
// export const deleteUser: AppRouteHandler<TDeleteUserRoute> = async (ctx) => {};
