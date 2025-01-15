import { CONFIG } from "@/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const db = drizzle(CONFIG.DATABASE_URL, { schema, casing: "snake_case", logger: CONFIG.DATABASE_LOGGING });

export type DB = typeof db;
