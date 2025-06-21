import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { CONFIG } from "@/config";
import * as schema from "./schema";

const client = postgres(CONFIG.DATABASE_URL, { prepare: false });

export const db = drizzle({
	client,
	schema,
	casing: "snake_case",
	logger: CONFIG.DATABASE_LOGGING,
});

export type DB = typeof db;
