import { Config } from "@/config";
import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(Config.DATABASE_URL, { casing: "snake_case" });

export type DB = typeof db;
