import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps } from "@/db/lib";
import { permissions } from "@/db/schema";

/**
 * Permissions Schema
 */
export const selectPermissionSchema = createSelectSchema(permissions).openapi("Permission");

export const insertPermissionSchema = createInsertSchema(permissions)
	.omit({ id: true, ...omitTimestamps })
	.openapi("InsertPermission");

export const updatePermissionSchema = createUpdateSchema(permissions)
	.omit({ id: true, ...omitTimestamps })
	.partial()
	.openapi("UpdatePermission");

export type TPermission = inferType<typeof selectPermissionSchema>;
