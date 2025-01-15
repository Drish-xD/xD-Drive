import { handleZodError } from "@/middleware/on-error.middleware";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json";
import type { AppBindings, AppInstance } from "./types";

export const createApp = () => {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook: handleZodError,
	});
};

export const initOpenAPI = (app: AppInstance) => {
	// initialize the OpenAPI specification
	app.doc31("/docs/openapi", {
		openapi: "3.1.0",
		info: {
			title: packageJSON.description,
			version: packageJSON.version,
			description: packageJSON.description,
			contact: packageJSON.author,
			license: {
				name: packageJSON.license,
				url: "https://opensource.org/license/gpl-3-0",
			},
		},
	});

	// initialize the API reference
	app.get(
		"/docs",
		apiReference({
			theme: "deepSpace",
			layout: "modern",
			spec: {
				url: "/docs/openapi",
			},
		}),
	);

	return app;
};
