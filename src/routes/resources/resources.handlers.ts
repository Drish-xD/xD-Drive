import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { resources as resourcesTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { computeFileHash, generateIdAndPath, generateResourcesTree, getUniqueFolderName } from "./resources.helpers";
import type { TCreateFolderRoute, TDeleteResourceRoute, TResourceRoute, TResourcesRoute, TUploadFileRoute } from "./resources.routes";

/**
 * Get Resources Listing
 */
export const resources: AppRouteHandler<TResourcesRoute> = async (ctx) => {
	const userId = ctx.get("userData").id;
	const db = ctx.get("db");
	const { page, limit, offset, order, filters, includeTotal } = ctx.req.valid("query");

	const orderBy = orderByQueryBuilder(order);
	// const where = whereQueryBuilder(filters);

	const [listing, totalCount] = await Promise.all([
		db.query.resources.findMany({
			limit,
			offset,
			orderBy: (f, o) => orderBy(f, o, "parentId"),
			where: (table, fn) => fn.eq(table.ownerId, userId),
		}),
		totalCountQueryBuilder(resourcesTable, includeTotal, eq(resourcesTable.ownerId, userId)),
	]);

	const pageCount = Math.ceil((totalCount ?? listing.length) / limit);

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
			data: generateResourcesTree(listing),
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Get Resource Details
 */
export const resource: AppRouteHandler<TResourceRoute> = async (ctx) => {
	const userId = ctx.get("userData").id;

	const resourceId = ctx.req.valid("param").id;

	const details = await ctx.var.db.query.resources.findFirst({
		where: (table, fn) => fn.and(fn.eq(table.ownerId, userId), fn.eq(table.id, resourceId)),
	});

	if (!details) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.RESOURCE.NOT_FOUND,
			cause: "resources.handlers@resource#001",
		});
	}

	return ctx.json(details, HTTP_STATUSES.OK.CODE);
};

/**
 * Create new Folder
 */
export const createFolder: AppRouteHandler<TCreateFolderRoute> = async (ctx) => {
	const db = ctx.get("db");
	const ownerId = ctx.get("userData").id;
	const { name, parentId } = ctx.req.valid("json");
	const { id, storagePath } = await generateIdAndPath(ownerId, parentId, true);
	const uniqueName = await getUniqueFolderName(db, ownerId, parentId, name);

	const [newCreatedFolder] = await db
		.insert(resourcesTable)
		.values({
			id,
			name: uniqueName,
			parentId,
			ownerId,
			storagePath,
			isFolder: true,
		})
		.returning();

	return ctx.json(
		{
			message: MESSAGES.RESOURCE.CREATED_FOLDER_SUCCESS,
			data: newCreatedFolder,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Upload new File
 */
export const uploadFile: AppRouteHandler<TUploadFileRoute> = async (ctx) => {
	const db = ctx.get("db");
	const ownerId = ctx.get("userData").id;
	const { parentId, file } = ctx.req.valid("form");
	const { id, storagePath } = await generateIdAndPath(ownerId, parentId, false);
	const contentHash = await computeFileHash(file);

	const [newFile] = await db
		.insert(resourcesTable)
		.values({
			id,
			name: file.name,
			size: file.size,
			mimeType: file.type,
			contentHash,
			parentId,
			ownerId,
			storagePath,
		})
		.returning();

	return ctx.json(
		{
			message: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS,
			data: newFile,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Delete Resource route
 */
export const deleteResource: AppRouteHandler<TDeleteResourceRoute> = async (ctx) => {
	const ownerId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const [deleted] = await ctx
		.get("db")
		.update(resourcesTable)
		.set({ status: "deleted", deletedAt: new Date() })
		.where(and(eq(resourcesTable.ownerId, ownerId), eq(resourcesTable.id, resourceId)))
		.returning();

	if (!deleted) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.RESOURCE.NOT_FOUND,
			cause: "resources.handlers@deleteResource#001",
		});
	}
	const deletedFilesOrFolder = { id: deleted.id, deletedAt: deleted.deletedAt, status: deleted.status };

	return ctx.json(
		{
			message: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS,
			data: deletedFilesOrFolder,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

// TODO : how to handle if folder is deleted with files inside it.
