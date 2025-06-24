import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const resourceStatusEnum = pgEnum("resource_status", ["active", "deleted", "archived"]);

export const accessLevelEnum = pgEnum("resource_access_level", ["viewer", "commenter", "editor"]);

export const targetTypeEnum = pgEnum("target_type", ["file", "folder"]);

export const actionTypeEnum = pgEnum("action_type", ["create", "rename", "move", "delete", "restore", "archive", "download", "share", "unshare", "upload"]);
