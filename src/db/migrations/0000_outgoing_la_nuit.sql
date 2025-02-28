CREATE TYPE "public"."resource_access_level" AS ENUM('viewer', 'commenter', 'editor');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('create', 'upload', 'download', 'update', 'rename', 'move', 'share', 'unshare', 'delete', 'restore', 'tag', 'untag', 'version_create', 'version_restore');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('active', 'deleted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'deleted');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_id" uuid,
	"activity_type" "activity_type" NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"granted_to" uuid,
	"is_public" boolean DEFAULT false NOT NULL,
	"access_level" "resource_access_level" DEFAULT 'viewer' NOT NULL,
	"public_link_token" varchar(128),
	"created_by" uuid NOT NULL,
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_valid_permission" CHECK (("permissions"."is_public" = true AND "permissions"."granted_to" IS NULL) OR ("permissions"."is_public" = false AND "permissions"."granted_to" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"is_folder" boolean DEFAULT false NOT NULL,
	"storage_path" text NOT NULL,
	"status" "resource_status" DEFAULT 'active' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"mime_type" varchar(255),
	"size" bigint DEFAULT 0 NOT NULL,
	"content_hash" varchar(128),
	"last_accessed_at" timestamp,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_tags" (
	"tag_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"confidence_score" integer,
	CONSTRAINT "resource_tags_tag_id_resource_id_pk" PRIMARY KEY("tag_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "resource_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"size" bigint NOT NULL,
	"storage_path" text NOT NULL,
	"content_hash" varchar(128) NOT NULL,
	"created_by" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified_at" timestamp,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"storage_quota" bigint DEFAULT 1073741824 NOT NULL,
	"used_storage" bigint DEFAULT 0 NOT NULL,
	"last_login_at" timestamp,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_displayName_unique" UNIQUE("display_name"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_granted_to_resources_id_fk" FOREIGN KEY ("granted_to") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_parent_id_resources_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_tags" ADD CONSTRAINT "resource_tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_versions" ADD CONSTRAINT "resource_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_user" ON "activity_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_resource" ON "activity_logs" USING btree ("resource_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_permissions_resource" ON "permissions" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_permissions_user" ON "permissions" USING btree ("granted_to") WHERE "permissions"."granted_to" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_permissions_public_link" ON "permissions" USING btree ("public_link_token") WHERE "permissions"."public_link_token" is not null;--> statement-breakpoint
CREATE INDEX "idx_resources_parent_id" ON "resources" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_resources_owner_id" ON "resources" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_resources_name_parent" ON "resources" USING btree ("parent_id","name","owner_id");--> statement-breakpoint
CREATE INDEX "idx_resource_tags_tag_id" ON "resource_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_versions_resource" ON "resource_versions" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_versions_current" ON "resource_versions" USING btree ("resource_id") WHERE "resource_versions"."is_current" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_name_system" ON "tags" USING btree ("name") WHERE "tags"."is_ai_generated" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_name_creator" ON "tags" USING btree ("name","created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");