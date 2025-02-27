import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const resourceStatusEnum = pgEnum("resource_status", ["active", "deleted", "archived"]);

export const accessLevelEnum = pgEnum("resource_access_level", ["viewer", "commenter", "editor"]);

export const activityTypeEnum = pgEnum("activity_type", [
	"create",
	"upload",
	"download",
	"update",
	"rename",
	"move",
	"share",
	"unshare",
	"delete",
	"restore",
	"tag",
	"untag",
	"version_create",
	"version_restore",
]);
