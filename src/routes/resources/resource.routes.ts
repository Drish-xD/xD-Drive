import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createErrorJson, createJson, createMessageSchema, createMultiPartForm, createUuidSchema } from "@/helpers/schema.helpers";
import { createFolderSchema, moveResourceSchema, renameResourceSchema, selectResourceSchema, uploadFileSchema } from "@/models";

/**
 * Create New Folder route
 */
export const createFolder = createRoute({
	method: "post",
	path: "/folder",
	request: {
		body: createJson({
			description: "Payload to create a new folder",
			schema: createFolderSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.CREATED.CODE]: createJson({
			description: "Created a new folder",
			schema: createMessageSchema({
				example: MESSAGES.RESOURCE.CREATED_FOLDER_SUCCESS,
			}).extend({ data: selectResourceSchema }),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TCreateFolderRoute = typeof createFolder;

/**
 * Upload new file route
 */
export const uploadFile = createRoute({
	method: "post",
	path: "/file",
	request: {
		body: createMultiPartForm({
			description: "Payload to upload a new file",
			schema: uploadFileSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.CREATED.CODE]: createJson({
			description: "Uploaded a new file",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS }).extend({
				data: selectResourceSchema,
			}),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TUploadFileRoute = typeof uploadFile;

/**
 * Resources Details route
 */
export const resource = createRoute({
	method: "get",
	path: "/:id",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get a resource details",
			schema: selectResourceSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TResourceRoute = typeof resource;

/**
 * Download Resource route
 */
export const downloadResource = createRoute({
	method: "get",
	path: "/:id/download",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: {
			content: {
				"application/octet-stream": {
					schema: {
						format: "binary",
						type: "string",
					},
				},
			},
			description: "Download a resource",
		},
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TDownloadResourceRoute = typeof downloadResource;

/**
 * Delete Resource route
 */
export const deleteResource = createRoute({
	method: "delete",
	path: "/:id/delete",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Delete a resource",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.DELETED_SUCCESS }),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TDeleteResourceRoute = typeof deleteResource;

/**
 * Archive Resource route
 */
export const archiveResource = createRoute({
	method: "patch",
	path: "/:id/archive",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Archive a resource",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.ARCHIVED_SUCCESS }),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TArchiveResourceRoute = typeof archiveResource;

/**
 * Restore Resource route
 */
export const restoreResource = createRoute({
	method: "patch",
	path: "/:id/restore",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Restore a resource",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.RESTORED_SUCCESS }),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TRestoreResourceRoute = typeof restoreResource;

/**
 * Rename Resource route
 */
export const renameResource = createRoute({
	method: "patch",
	path: "/:id/rename",
	request: {
		body: createJson({
			description: "Payload to rename a resource",
			schema: renameResourceSchema,
		}),
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Rename a resource",
			schema: selectResourceSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TRenameResourceRoute = typeof renameResource;

/**
 * Move Resource route
 */
export const moveFile = createRoute({
	method: "put",
	path: "/:id/move",
	request: {
		body: createJson({
			description: "Payload to move a file",
			schema: moveResourceSchema,
		}),
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Move a file",
			schema: selectResourceSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Resource"],
});

export type TMoveFileRoute = typeof moveFile;
