import { and, eq, ilike, isNull } from "drizzle-orm";
import { HTTP_STATUSES } from "@/constants";
import { resources as resourcesTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder, whereQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import type { TGetResourceChildrenRoute, TResourcesRoute } from "./resources.routes";

/**
 * Get Resources Listing
 */
export const resources: AppRouteHandler<TResourcesRoute> = async (ctx) => {
	const { logger, db, userData } = ctx.var;
	const userId = userData.id;
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	const orderBy = orderByQueryBuilder(order);
	const where = whereQueryBuilder(
		filters,
		{
			isFolder: {
				column: resourcesTable.isFolder,
				operator: eq,
				transform: (value) => value === "true",
			},
			name: {
				column: resourcesTable.name,
				operator: (column, value) => ilike(column, `%${value}%`),
			},
		},
		and(eq(resourcesTable.ownerId, userId), isNull(resourcesTable.parentId), eq(resourcesTable.status, "active")),
	);
	logger.debug("resources.handlers@resources#beforeQuery", { orderBy, where });

	const [listing, totalCount] = await Promise.all([
		db.query.resources.findMany({
			limit,
			offset,
			orderBy: (f, o) => orderBy(f, o, "parentId"),
			where,
		}),
		totalCountQueryBuilder(resourcesTable, includeTotal, where),
	]);
	logger.debug("resources.handlers@resources#afterQuery", { listingCount: listing.length, totalCount });

	const pageCount = Math.ceil((totalCount ?? listing.length) / limit);

	return ctx.json(
		{
			data: listing,
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
 * Get Resource Children
 */
export const getResourceChildren: AppRouteHandler<TGetResourceChildrenRoute> = async (ctx) => {
	const { logger, db, userData } = ctx.var;
	const userId = userData.id;
	const resourceId = ctx.req.valid("param").id;
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	const orderBy = orderByQueryBuilder(order);
	const where = whereQueryBuilder(
		filters,
		{
			isFolder: {
				column: resourcesTable.isFolder,
				operator: eq,
				transform: (value) => value === "true",
			},
			name: {
				column: resourcesTable.name,
				operator: (column, value) => ilike(column, `%${value}%`),
			},
			parentId: {
				column: resourcesTable.parentId,
				operator: eq,
			},
		},
		and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.parentId, resourceId), eq(resourcesTable.status, "active")),
	);
	logger.debug("resources.handlers@getResourceChildren#beforeQuery", { orderBy, where });

	const [listing, totalCount] = await Promise.all([
		db.query.resources.findMany({
			limit,
			offset,
			orderBy: (f, o) => orderBy(f, o, "parentId"),
			where,
		}),
		totalCountQueryBuilder(resourcesTable, includeTotal, where),
	]);
	logger.debug("resources.handlers@getResourceChildren#afterQuery", { listingCount: listing.length, totalCount });

	const pageCount = Math.ceil((totalCount ?? listing.length) / limit);

	return ctx.json(
		{
			data: listing,
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
