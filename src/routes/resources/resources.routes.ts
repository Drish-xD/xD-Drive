import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createMessageSchema, createMultiPartForm, createUuidSchema } from "@/helpers/schema.helpers";
import { createFolderSchema, selectResourceSchema, uploadFileSchema } from "@/models";
import { createRoute } from "@hono/zod-openapi";

/**
 * Resources Listing route
 */
export const resources = createRoute({
	path: "/",
	method: "get",
	tags: ["Resources"],
	request: {
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get all resources",
			schema: createPaginationResponse(selectResourceSchema),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TResourcesRoute = typeof resources;

/**
 * Resources Details route
 */
export const resource = createRoute({
	path: "/:id",
	method: "get",
	tags: ["Resources"],
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get a resource details",
			schema: selectResourceSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.RESOURCE.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TResourceRoute = typeof resource;

/**
 * Create New Folder route
 */
export const createFolder = createRoute({
	path: "/folder",
	method: "post",
	tags: ["Resources"],
	request: {
		body: createJson({
			description: "Payload to create a new folder",
			schema: createFolderSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Created a new folder",
			schema: createMessageSchema({
				example: MESSAGES.RESOURCE.CREATED_FOLDER_SUCCESS,
			}).extend({ data: selectResourceSchema }),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TCreateFolderRoute = typeof createFolder;

/**
 * Upload new file route
 */
export const uploadFile = createRoute({
	path: "/file",
	method: "post",
	tags: ["Resources"],
	request: {
		body: createMultiPartForm({
			description: "Payload to upload a new file",
			schema: uploadFileSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Update user details",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.UPLOADED_FILE_SUCCESS }).extend({
				data: selectResourceSchema,
			}),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.RESOURCE.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUploadFileRoute = typeof uploadFile;

/**
 * Delete Resource route
 */
export const deleteResource = createRoute({
	path: "/:id",
	method: "delete",
	tags: ["Resources"],
	request: {
		params: createUuidSchema({ description: "Resource ID", example: "123e4567-e89b-12d3-a456-426614174000" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Delete a resource",
			schema: createMessageSchema({ example: MESSAGES.RESOURCE.DELETED_SUCCESS }).extend({
				data: selectResourceSchema.pick({
					deletedAt: true,
					id: true,
					status: true,
				}),
			}),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.RESOURCE.NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TDeleteResourceRoute = typeof deleteResource;
