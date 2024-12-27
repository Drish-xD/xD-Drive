import { z } from "zod";

const strToBoolean = z.coerce
	.string()
	.transform((val) => val === "true")
	.default("false")
	.optional();

const configSchema = z.object({
	NODE_ENV: z.enum(["production", "test", "dev"]).default("dev").optional(),
	PORT: z.coerce.number().default(3000).optional(),

	// JWT
	JWT_SECRET: z.string(),

	// DATABASE
	DATABASE_URL: z.string(),
	DATABASE_MIGRATING: strToBoolean,
	DATABASE_SEEDING: strToBoolean,
});

export const Config = configSchema.parse(Bun.env);
export type Config = z.infer<typeof configSchema>;
