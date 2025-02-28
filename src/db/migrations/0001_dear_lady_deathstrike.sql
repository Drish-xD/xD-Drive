DROP INDEX "idx_users_email";--> statement-breakpoint
CREATE INDEX "idx_resources_status" ON "resources" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_resources_content_hash" ON "resources" USING btree ("content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_resource_versions_number" ON "resource_versions" USING btree ("version_number","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree (lower("email"));