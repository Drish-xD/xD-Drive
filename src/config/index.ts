import { z } from "zod";

const strToBoolean = z.coerce
	.string()
	.transform((val) => val === "true")
	.default("false");

const configSchema = z.object({
	APP_ENV: z.enum(["prod", "test", "dev"]).default("dev").optional(),
	PORT: z.coerce.number().default(3000).optional(),

	// JWT
	JWT_SECRET: z.string(),

	// DATABASE
	DATABASE_URL: z.string(),
	DATABASE_LOGGING: strToBoolean,
});

export const Config = configSchema.parse(Bun.env);
export type Config = z.infer<typeof configSchema>;
