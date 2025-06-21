import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod/v4";

const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory({ zodInstance: z });

export type { output as inferType } from "zod/v4";
export { createInsertSchema, createSelectSchema, createUpdateSchema, z };

export type PartialUnknown<T> = Partial<Record<keyof T, unknown>>;
