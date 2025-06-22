import { and, eq, ilike, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { users as usersTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder, whereQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import type { TDeleteUserRoute, TUpdateUserRoute, TUserRoute, TUsersMeRoute, TUsersRoute } from "./users.routes";

/**
 * Current user details
 */
export const currentUser: AppRouteHandler<TUsersMeRoute> = async (ctx) => {
	const userDetails = ctx.get("userData");

	return ctx.json(userDetails, HTTP_STATUSES.OK.CODE);
};

/**
 * Update User Details
 */
export const updateCurrentUser: AppRouteHandler<TUpdateUserRoute> = async (ctx) => {
	const userDetails = ctx.get("userData");
	const updatePayload = ctx.req.valid("json");

	const [updatedUserDetails] = await ctx.var.db
		.update(usersTable)
		.set(updatePayload)
		.where(and(eq(usersTable.id, userDetails?.id), eq(usersTable.status, "active")))
		.returning();

	if (!updatedUserDetails) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "users.handlers@user#001",
			message: MESSAGES.USER.NOT_FOUND,
		});
	}
	const { passwordHash, ...data } = updatedUserDetails;

	return ctx.json(
		{
			data,
			message: MESSAGES.USER.UPDATED_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Delete User
 */
export const deleteCurrentUser: AppRouteHandler<TDeleteUserRoute> = async (ctx) => {
	const userDetails = ctx.get("userData");

	const [deletedUser] = await ctx.var.db
		.update(usersTable)
		.set({ deletedAt: new Date(), status: "deleted" })
		.where(and(eq(usersTable.id, userDetails.id), isNull(usersTable.deletedAt)))
		.returning();

	if (!deletedUser?.deletedAt) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "users.handlers@user#001",
			message: MESSAGES.USER.NOT_FOUND,
		});
	}

	return ctx.json(
		{
			data: {
				deletedAt: deletedUser.deletedAt,
				id: deletedUser.id,
				status: deletedUser.status,
			},
			message: MESSAGES.USER.DELETED_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Get Users Listing
 */
export const users: AppRouteHandler<TUsersRoute> = async (ctx) => {
	const db = ctx.get("db");
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	const orderBy = orderByQueryBuilder(order);
	const where = whereQueryBuilder(filters, {
		email: {
			column: usersTable.email,
			operator: eq,
		},
		fullName: {
			column: usersTable.fullName,
			operator: (column, value) => ilike(column, `%${value}%`),
		},
	});

	const [usersListing, totalCount] = await Promise.all([
		db.query.users.findMany({
			columns: { passwordHash: false },
			limit,
			offset,
			orderBy,
			where,
		}),
		totalCountQueryBuilder(usersTable, includeTotal, where),
	]);

	const pageCount = Math.ceil((totalCount ?? usersListing.length) / limit);

	return ctx.json(
		{
			data: usersListing,
			meta: {
				appliedFilters: filters,
				currentPage: page,
				itemsPerPage: limit,
				pageCount: pageCount,
				sortOrder: order,
				startIndex: offset,
				totalCount: totalCount,
			},
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Get User Details
 */
export const user: AppRouteHandler<TUserRoute> = async (ctx) => {
	const userId = ctx.req.valid("param")?.id;

	const userDetails = await ctx.var.db.query.users.findFirst({
		columns: { passwordHash: false },
		where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
	});

	if (!userDetails) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "users.handlers@user#001",
			message: MESSAGES.USER.NOT_FOUND,
		});
	}

	return ctx.json(userDetails, HTTP_STATUSES.OK.CODE);
};
