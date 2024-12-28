import { handleZodError } from "@/helpers/errors";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "./types";

export * from "./types";

export function createApp() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook: handleZodError,
	});
}
