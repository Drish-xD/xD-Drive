import { z } from "@hono/zod-openapi";
import { createSchemaFactory } from "drizzle-zod";

const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory({ zodInstance: z });

export type { infer as inferType } from "zod";
export { createInsertSchema, createSelectSchema, createUpdateSchema };

export type PartialUnknown<T> = Partial<Record<keyof T, unknown>>;
