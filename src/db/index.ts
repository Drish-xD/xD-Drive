import { Config } from "@/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const db = drizzle(Config.DATABASE_URL, { schema, casing: "snake_case", logger: Config.DATABASE_LOGGING });

export type DB = typeof db;
