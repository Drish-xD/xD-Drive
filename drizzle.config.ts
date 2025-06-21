import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./src/db",
	schema: "./src/db/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "NULL",
	},
	verbose: false,
	casing: "snake_case",
});
