import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { HTTP_STATUSES } from "@/constants";
import { activityLogs as activityLogsTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder, whereQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import type { TGetResourceActivityRoute, TGetUserActivityRoute } from "./activity.routes";

/**
 * Get user activity
 */
export const getUserActivity: AppRouteHandler<TGetUserActivityRoute> = async (ctx) => {
	const { logger, db } = ctx.var;
	const userId = ctx.get("userData")?.id;
	const { page, limit, filters, includeTotal, offset, order } = ctx.req.valid("query");

	logger.debug("activity.handlers@getUserActivity#start", { filters, includeTotal, limit, offset, order, page, userId });

	const orderBy = orderByQueryBuilder(order);
	const where = whereQueryBuilder(
		filters,
		{
			actionType: {
				column: activityLogsTable.actionType,
				operator: eq,
			},
			createdAt: {
				column: activityLogsTable.createdAt,
				operator: (column, value) => {
					const start = startOfDay(new Date(value as string));
					const end = endOfDay(new Date(value as string));

					return and(gte(column, start), lte(column, end));
				},
			},
		},
		eq(activityLogsTable.userId, userId),
	);

	const [logs, totalCount] = await Promise.all([
		db.query.activityLogs.findMany({
			limit,
			offset,
			orderBy,
			where,
		}),
		totalCountQueryBuilder(activityLogsTable, includeTotal, where),
	]);
	logger.debug("activity.handlers@getUserActivity#afterQuery", { logsCount: logs.length, totalCount });
	const pageCount = Math.ceil((totalCount ?? logs.length) / limit);

	return ctx.json(
		{
			data: logs,
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
 * Get resource activity
 */
export const getResourceActivity: AppRouteHandler<TGetResourceActivityRoute> = async (ctx) => {
	const { logger, db } = ctx.var;
	const resourceId = ctx.req.valid("param").id;
	const { page, limit, filters, includeTotal, offset, order } = ctx.req.valid("query");

	logger.debug("activity.handlers@getResourceActivity#start", { filters, includeTotal, limit, offset, order, page, resourceId });

	const orderBy = orderByQueryBuilder(order);
	const where = whereQueryBuilder(
		filters,
		{
			actionType: {
				column: activityLogsTable.actionType,
				operator: eq,
			},
			createdAt: {
				column: activityLogsTable.createdAt,
				operator: (column, value) => {
					const start = startOfDay(new Date(value as string));
					const end = endOfDay(new Date(value as string));

					return and(gte(column, start), lte(column, end));
				},
			},
		},
		eq(activityLogsTable.resourceId, resourceId),
	);

	const [logs, totalCount] = await Promise.all([
		db.query.activityLogs.findMany({
			limit,
			offset,
			orderBy,
			where,
		}),
		totalCountQueryBuilder(activityLogsTable, includeTotal, where),
	]);
	logger.debug("activity.handlers@getResourceActivity#afterQuery", { logsCount: logs.length, totalCount });
	const pageCount = Math.ceil((totalCount ?? logs.length) / limit);

	return ctx.json(
		{
			data: logs,
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
