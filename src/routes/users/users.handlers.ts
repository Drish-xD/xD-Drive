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
	const { logger, userData } = ctx.var;

	logger.debug("users.handlers@currentUser#userData", { userId: userData?.id });

	return ctx.json(userData, HTTP_STATUSES.OK.CODE);
};

/**
 * Update User Details
 */
export const updateCurrentUser: AppRouteHandler<TUpdateUserRoute> = async (ctx) => {
	const { logger, userData } = ctx.var;
	const updatePayload = ctx.req.valid("json");

	const [updatedUserDetails] = await ctx.var.db
		.update(usersTable)
		.set(updatePayload)
		.where(and(eq(usersTable.id, userData?.id), eq(usersTable.status, "active")))
		.returning();

	logger.debug("users.handlers@updateCurrentUser#afterUpdate", { updatedUserDetails });

	if (!updatedUserDetails) {
		logger.error("users.handlers@updateCurrentUser#notFound", { userId: userData?.id });

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
	const { logger, userData } = ctx.var;

	const [deletedUser] = await ctx.var.db
		.update(usersTable)
		.set({ deletedAt: new Date(), status: "deleted" })
		.where(and(eq(usersTable.id, userData?.id), isNull(usersTable.deletedAt)))
		.returning();

	logger.debug("users.handlers@deleteCurrentUser#afterDelete", { deletedUser });

	if (!deletedUser?.deletedAt) {
		logger.error("users.handlers@deleteCurrentUser#notFound", { userId: userData?.id });

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
	const { logger, db } = ctx.var;
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	logger.debug("users.handlers@users#start", { filters, includeTotal, limit, offset, order, page });

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

	logger.debug("users.handlers@users#afterQuery", { totalCount, usersCount: usersListing.length });

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
	const { logger } = ctx.var;
	const userId = ctx.req.valid("param")?.id;
	logger.debug("users.handlers@user#start", { userId });

	const userDetails = await ctx.var.db.query.users.findFirst({
		columns: { passwordHash: false },
		where: (users, fn) => fn.and(fn.eq(users.id, userId), fn.eq(users.status, "active")),
	});
	logger.debug("users.handlers@user#afterQuery", { userDetails });

	if (!userDetails) {
		logger.error("users.handlers@user#notFound", { userId });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "users.handlers@user#001",
			message: MESSAGES.USER.NOT_FOUND,
		});
	}

	return ctx.json(userDetails, HTTP_STATUSES.OK.CODE);
};
