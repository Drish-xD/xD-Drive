import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { users as usersTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import { and, eq, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { TDeleteUserRoute, TUpdateUserRoute, TUserRoute, TUsersMeRoute, TUsersRoute } from "./users.routes";

/**
 * Current user details
 */
export const me: AppRouteHandler<TUsersMeRoute> = async (ctx) => {
	const userDetails = ctx.get("userData");

	return ctx.json(userDetails, HTTP_STATUSES.OK.CODE);
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
export const user: AppRouteHandler<TUserRoute> = async (ctx) => {
	const userId = ctx.req.valid("param")?.id;

	const userDetails = await ctx.var.db.query.users.findFirst({
		columns: { passwordHash: false },
		where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
	});

	if (!userDetails) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.USER.NOT_FOUND,
			cause: "users.handlers@user#001",
		});
	}

	return ctx.json(userDetails, HTTP_STATUSES.OK.CODE);
};

// /**
//  * Update User Details
//  */
export const updateUser: AppRouteHandler<TUpdateUserRoute> = async (ctx) => {
	const userId = ctx.req.valid("param")?.id;
	const updatePayload = ctx.req.valid("json");

	const [updatedUserDetails] = await ctx.var.db
		.update(usersTable)
		.set(updatePayload)
		.where(and(eq(usersTable.id, userId), eq(usersTable.status, "active")))
		.returning();

	if (!updatedUserDetails) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.USER.NOT_FOUND,
			cause: "users.handlers@user#001",
		});
	}
	const { passwordHash, ...data } = updatedUserDetails;

	return ctx.json(
		{
			message: MESSAGES.USER.UPDATED_SUCCESS,
			data,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

// /**
//  * Delete User
//  */
export const deleteUser: AppRouteHandler<TDeleteUserRoute> = async (ctx) => {
	const userId = ctx.req.valid("param")?.id;

	const [deletedUser] = await ctx.var.db
		.update(usersTable)
		.set({ deletedAt: new Date(), status: "deleted" })
		.where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)))
		.returning();

	if (!deletedUser?.deletedAt) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.USER.NOT_FOUND,
			cause: "users.handlers@user#001",
		});
	}

	return ctx.json(
		{
			message: MESSAGES.USER.DELETED_SUCCESS,
			data: {
				id: deletedUser.id,
				status: deletedUser.status,
				deletedAt: deletedUser.deletedAt,
			},
		},
		HTTP_STATUSES.OK.CODE,
	);
};
