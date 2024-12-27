import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema/*",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgresql://owner:geC5KQaqPB9f@ep-dry-salad-a1skud9g-pooler.ap-southeast-1.aws.neon.tech/auth?sslmode=require",
	},
	verbose: true,
	casing: "snake_case",
});
