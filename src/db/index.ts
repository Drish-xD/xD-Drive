import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { CONFIG } from "@/config";
import * as schema from "./schema";

const client = postgres(CONFIG.DATABASE_URL, { prepare: false });

export const db = drizzle({
	casing: "snake_case",
	client,
	logger: CONFIG.DATABASE_LOGGING,
	schema,
});

export type DB = typeof db;
