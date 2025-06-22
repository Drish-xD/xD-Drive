import { and, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { storage } from "@/db/lib/storage";
import { resources as resourcesTable, users as usersTable } from "@/db/schema";
import type { AppRouteHandler } from "@/helpers/types";
import type {
	TArchiveResourceRoute,
	TCreateFolderRoute,
	TDeleteResourceRoute,
	TDownloadResourceRoute,
	TMoveFileRoute,
	TRenameResourceRoute,
	TResourceRoute,
	TRestoreResourceRoute,
	TUploadFileRoute,
} from "./resource.routes";
import { computeFileHash, generateIdAndPath, generateNewStoragePath, getUniqueFolderName } from "./resources.helpers";

/**
 * Create new Folder
 */
export const createFolder: AppRouteHandler<TCreateFolderRoute> = async (ctx) => {
	const db = ctx.get("db");
	const ownerId = ctx.get("userData").id;
	const { name, parentId } = ctx.req.valid("json");
	const { id, storagePath } = await generateIdAndPath(ownerId, parentId);
	const uniqueName = await getUniqueFolderName(db, ownerId, name, parentId);

	const placeholderPath = `${storagePath}/.emptyFolderPlaceholder`;

	const { error } = await storage.from("uploads").upload(placeholderPath, new Blob(), {
		metadata: {
			folderName: uniqueName,
			ownerId,
		},
		upsert: true,
	});

	if (error) {
		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			cause: "resources.handlers@createFolder#001",
			message: MESSAGES.RESOURCE.CREATED_FOLDER_FAILED,
		});
	}

	const [newCreatedFolder] = await db
		.insert(resourcesTable)
		.values({
			id,
			isFolder: true,
			name: uniqueName,
			ownerId,
			parentId,
			storagePath,
		})
		.returning()
		.catch(async () => {
			await storage.from("uploads").remove([placeholderPath]);

			throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
				cause: "resources.handlers@createFolder#002",
				message: MESSAGES.RESOURCE.CREATED_FOLDER_FAILED,
			});
		});

	return ctx.json(
		{
			data: newCreatedFolder,
			message: MESSAGES.RESOURCE.CREATED_FOLDER_SUCCESS,
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

	const [existingFile, userStorage] = await Promise.all([
		await db.query.resources.findFirst({
			where: (r, { and, or, eq, isNull }) =>
				and(eq(r.ownerId, ownerId), parentId ? eq(r.parentId, parentId) : isNull(r.parentId), or(eq(r.name, file.name), eq(r.contentHash, contentHash))),
		}),
		db.query.users.findFirst({
			columns: {
				storageQuota: true,
				usedStorage: true,
			},
			where: (u, { eq }) => eq(u.id, ownerId),
		}),
	]);

	if (existingFile) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "resources.handlers@uploadFile#001",
			message: MESSAGES.RESOURCE.FILE_ALREADY_EXISTS,
		});
	}

	if (userStorage) {
		if (userStorage.usedStorage + file.size > userStorage.storageQuota) {
			throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
				cause: "resources.handlers@uploadFile#002",
				message: MESSAGES.RESOURCE.STORAGE_QUOTA_EXCEEDED,
			});
		}
	}

	const { data, error } = await storage.from("uploads").upload(storagePath, file, {
		metadata: {
			fileName: file.name,
			ownerId,
		},
		upsert: true,
	});

	if (error) {
		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			cause: "resources.handlers@uploadFile#003",
			message: MESSAGES.RESOURCE.UPLOAD_FAILED,
		});
	}

	try {
		const newFile = await db.transaction(async (tx) => {
			const [newFile] = await db
				.insert(resourcesTable)
				.values({
					contentHash,
					id,
					mimeType: file.type,
					name: file.name,
					ownerId,
					parentId,
					size: file.size,
					storagePath: data?.path,
				})
				.returning();

			await tx
				.update(usersTable)
				.set({ usedStorage: sql`${usersTable.usedStorage} + ${file.size}` })
				.where(eq(usersTable.id, ownerId));

			return newFile;
		});

		return ctx.json(
			{
				data: newFile,
				message: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS,
			},
			HTTP_STATUSES.CREATED.CODE,
		);
	} catch (error) {
		await storage.from("uploads").remove([storagePath]);

		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			cause: "resources.handlers@uploadFile#004",
			message: MESSAGES.RESOURCE.UPLOAD_FAILED,
		});
	}
};

/**
 * Get Resource Details
 */
export const resource: AppRouteHandler<TResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;

	const resourceId = ctx.req.valid("param").id;

	const details = await db.query.resources.findFirst({
		where: (r, { and, eq }) => and(eq(r.ownerId, userId), eq(r.id, resourceId), eq(r.status, "active")),
	});

	if (!details) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@resource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	return ctx.json(details, HTTP_STATUSES.OK.CODE);
};

/**
 * Download Resource
 */
export const downloadResource: AppRouteHandler<TDownloadResourceRoute> = async (ctx) => {
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const details = await ctx.var.db.query.resources.findFirst({
		where: (r, { and, eq }) => and(eq(r.ownerId, userId), eq(r.id, resourceId), eq(r.isFolder, false)),
	});

	if (!details) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@downloadResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	ctx.res.headers.set("Content-Disposition", `attachment; filename="${details.name}"`);
	ctx.res.headers.set("Content-Type", details.mimeType as string);

	return ctx.body("dummy file content", HTTP_STATUSES.OK.CODE);
};

/**
 * Rename Resource
 */
export const renameResource: AppRouteHandler<TRenameResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;
	const { name } = ctx.req.valid("json");

	const [updated] = await db
		.update(resourcesTable)
		.set({ name })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")))
		.returning();

	if (!updated) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@renameResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	return ctx.json(updated, HTTP_STATUSES.OK.CODE);
};

/**
 * Move Resource
 */
export const moveFile: AppRouteHandler<TMoveFileRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;
	const { parentId } = ctx.req.valid("json");

	const [resource, newParent] = await Promise.all([
		db.query.resources.findFirst({
			columns: {
				storagePath: true,
			},
			where: (r, { and, eq }) => and(eq(r.ownerId, userId), eq(r.id, resourceId), eq(r.isFolder, false), eq(r.status, "active")),
		}),
		parentId
			? db.query.resources.findFirst({
					columns: {
						storagePath: true,
					},
					where: (r, { and, eq }) => and(eq(r.ownerId, userId), eq(r.id, parentId), eq(r.isFolder, true), eq(r.status, "active")),
				})
			: { storagePath: undefined },
	]);

	if (!resource) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@moveResource#001",
			message: MESSAGES.RESOURCE.FILE_NOT_FOUND,
		});
	}

	if (!newParent) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@moveResource#002",
			message: MESSAGES.RESOURCE.PARENT_NOT_FOUND,
		});
	}

	const newStoragePath = generateNewStoragePath(userId, resourceId, newParent.storagePath);

	const { error } = await storage.from("uploads").move(resource.storagePath, newStoragePath);

	if (error) {
		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			cause: "resources.handlers@moveResource#003",
			message: MESSAGES.RESOURCE.MOVE_FAILED,
		});
	}

	try {
		const [updated] = await db
			.update(resourcesTable)
			.set({ parentId: parentId || null, storagePath: newStoragePath })
			.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")))
			.returning();

		if (!updated) {
			throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
				cause: "resources.handlers@moveResource#004",
				message: MESSAGES.RESOURCE.NOT_FOUND,
			});
		}

		return ctx.json(updated, HTTP_STATUSES.OK.CODE);
	} catch (error) {
		await storage.from("uploads").move(newStoragePath, resource.storagePath);

		throw new HTTPException(HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE, {
			cause: "resources.handlers@moveResource#005",
			message: MESSAGES.RESOURCE.MOVE_FAILED,
		});
	}
};

/**
 * Delete Resource
 */
export const deleteResource: AppRouteHandler<TDeleteResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const [updated] = await db
		.update(resourcesTable)
		.set({ deletedAt: new Date(), status: "deleted" })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId)))
		.returning({
			id: resourcesTable.id,
			status: resourcesTable.status,
		});

	if (!updated) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@deleteResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	return ctx.json(
		{
			data: updated,
			message: MESSAGES.RESOURCE.DELETED_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Archive Resource
 */
export const archiveResource: AppRouteHandler<TArchiveResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const [updated] = await db
		.update(resourcesTable)
		.set({ status: "archived" })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId), eq(resourcesTable.status, "active")))
		.returning({
			id: resourcesTable.id,
			status: resourcesTable.status,
		});

	if (!updated) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@archiveResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	return ctx.json(
		{
			data: updated,
			message: MESSAGES.RESOURCE.DELETED_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};

/**
 * Restore Resource
 */
export const restoreResource: AppRouteHandler<TRestoreResourceRoute> = async (ctx) => {
	const db = ctx.get("db");
	const userId = ctx.get("userData").id;
	const resourceId = ctx.req.valid("param").id;

	const [updated] = await db
		.update(resourcesTable)
		.set({ deletedAt: null, status: "active" })
		.where(and(eq(resourcesTable.ownerId, userId), eq(resourcesTable.id, resourceId)))
		.returning({
			id: resourcesTable.id,
			status: resourcesTable.status,
		});

	if (!updated) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.handlers@restoreResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	return ctx.json(
		{
			data: updated,
			message: MESSAGES.RESOURCE.RESTORED_SUCCESS,
		},
		HTTP_STATUSES.OK.CODE,
	);
};
