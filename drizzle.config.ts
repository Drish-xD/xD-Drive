import { defineConfig } from "drizzle-kit";

export default defineConfig({
	casing: "snake_case",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "NULL",
	},
	dialect: "postgresql",
	out: "./src/db",
	schema: "./src/db/schema/index.ts",
	verbose: false,
});
