import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export * from "./storage";
export * from "./timestamps";
export * from "./zod.utils";

export const lower = (email: AnyPgColumn): SQL => sql`lower(${email})`;
