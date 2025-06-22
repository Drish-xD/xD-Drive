import { and, eq, ilike, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { storage } from "@/db/lib/storage";
import { resources as resourcesTable } from "@/db/schema";
import { orderByQueryBuilder, totalCountQueryBuilder, whereQueryBuilder } from "@/helpers/pagination.helpers";
import type { AppRouteHandler } from "@/helpers/types";
import { computeFileHash, generateIdAndPath, generateResourcesTree, getUniqueFolderName } from "./resources.helpers";
import type {
	TCreateFolderRoute,
	TDeleteResourceRoute,
	TDownloadResourceRoute,
	TGetResourceChildrenRoute,
	TResourceRoute,
	TResourcesRoute,
	TUpdateResourceRoute,
	TUploadFileRoute,
} from "./resources.routes";

/**
 * Get Resources Listing
 */
export const resources: AppRouteHandler<TResourcesRoute> = async (ctx) => {
	const userId = ctx.get("userData").id;
	const db = ctx.get("db");
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
			parentId: {
				column: resourcesTable.parentId,
				operator: eq,
			},
			name: {
				column: resourcesTable.name,
				operator: (column, value) => ilike(column, `%${value}%`),
			},
		},
		and(eq(resourcesTable.ownerId, userId), isNull(resourcesTable.parentId), eq(resourcesTable.status, "active")),
	);

	const [listing, totalCount] = await Promise.all([
		db.query.resources.findMany({
			limit,
			offset,
			orderBy: (f, o) => orderBy(f, o, "parentId"),
			where,
		}),
		totalCountQueryBuilder(resourcesTable, includeTotal, where),
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
			data: listing,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Get Resource Details
 */
export const resource: AppRouteHandler<TResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;

	const resourceId = ctx.req.valid("param").id;

	const details = await db.query.resources.findFirst({
		where: and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")),
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
 * Get Resource Children
 */
export const getResourceChildren: AppRouteHandler<TGetResourceChildrenRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
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
			parentId: {
				column: resourcesTable.parentId,
				operator: eq,
			},
			name: {
				column: resourcesTable.name,
				operator: (column, value) => ilike(column, `%${value}%`),
			},
		},
		and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.parentId, resourceId), eq(resourcesTable.status, "active")),
	);

	const [listing, totalCount] = await Promise.all([
		db.query.resources.findMany({
			limit,
			offset,
			orderBy: (f, o) => orderBy(f, o, "parentId"),
			where,
		}),
		totalCountQueryBuilder(resourcesTable, includeTotal, where),
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
 * Update Resource
 */
export const updateResource: AppRouteHandler<TUpdateResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;
	const { name, parentId } = ctx.req.valid("json");

	const [updated] = await db
		.update(resourcesTable)
		.set({ name, parentId })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")))
		.returning();

	if (!updated) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.RESOURCE.NOT_FOUND,
			cause: "resources.handlers@updateResource#001",
		});
	}

	return ctx.json(updated, HTTP_STATUSES.OK.CODE);
};

/**
 * Download Resource
 */

export const downloadResource: AppRouteHandler<TDownloadResourceRoute> = async (ctx) => {
	// ! This is a placeholder implementation
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const details = await ctx.var.db.query.resources.findFirst({
		where: (table, fn) => fn.and(fn.eq(table.ownerId, userId), fn.eq(table.id, resourceId), fn.eq(table.isFolder, false)),
	});

	if (!details) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			message: MESSAGES.RESOURCE.NOT_FOUND,
			cause: "resources.handlers@downloadResource#001",
		});
	}

	ctx.res.headers.set("Content-Disposition", `attachment; filename="${details.name}"`);
	ctx.res.headers.set("Content-Type", details.mimeType as string);

	return ctx.body("dummy file content", HTTP_STATUSES.OK.CODE);
};

/**
 * Create new Folder
 */
export const createFolder: AppRouteHandler<TCreateFolderRoute> = async (ctx) => {
	const db = ctx.get("db");
	const ownerId = ctx.get("userData").id;
	const { name, parentId } = ctx.req.valid("json");
	const { id, storagePath } = await generateIdAndPath(ownerId, parentId);
	const uniqueName = await getUniqueFolderName(db, ownerId, name, parentId);

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
		HTTP_STATUSES.CREATED.CODE,
	);
};

/**
 * Upload new File
 */
export const uploadFile: AppRouteHandler<TUploadFileRoute> = async (ctx) => {
	const db = ctx.get("db");
	const ownerId = ctx.get("userData").id;
	const { parentId, file } = ctx.req.valid("form");

	const contentHash = await computeFileHash(file);
	const { id, storagePath } = await generateIdAndPath(ownerId, parentId);

	const [existingByName, existingByHash] = await Promise.all([
		db.query.resources.findFirst({
			where: (r, { and, eq }) => and(eq(r.ownerId, ownerId), eq(r.name, file.name), parentId ? eq(r.parentId, parentId) : isNull(r.parentId)),
		}),
		db.query.resources.findFirst({
			where: (r, { and, eq }) => and(eq(r.ownerId, ownerId), eq(r.contentHash, contentHash)),
		}),
	]);

	if (existingByName || existingByHash) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			message: MESSAGES.RESOURCE.FILE_ALREADY_EXISTS,
			cause: "resources.handlers@uploadFile#001",
		});
	}

	// Upload to S3
	const { data, error } = await storage.from("uploads").upload(storagePath, file, { upsert: true });

	if (error) {
		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			message: MESSAGES.RESOURCE.UPLOAD_FAILED,
			cause: "resources.handlers@uploadFile#002",
		});
	}

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
			storagePath: data?.fullPath,
		})
		.returning()
		.catch(async () => {
			await storage.from("uploads").remove([storagePath]);

			throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
				message: MESSAGES.RESOURCE.UPLOAD_FAILED,
				cause: "resources.handlers@uploadFile#003",
			});
		});

	return ctx.json(
		{
			message: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS,
			data: newFile,
		},
		HTTP_STATUSES.CREATED.CODE,
	);
};

/**
 * Delete Resource route
 */
export const deleteResource: AppRouteHandler<TDeleteResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const [deleted] = await db
		.update(resourcesTable)
		.set({ status: "deleted", deletedAt: new Date() })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")))
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
			message: MESSAGES.RESOURCE.DELETED_SUCCESS,
			data: deletedFilesOrFolder,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

// TODO : how to handle if folder is deleted with files inside it.
