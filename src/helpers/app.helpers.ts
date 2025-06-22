import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { handleZodError } from "@/middleware/on-error.middleware";
import packageJSON from "../../package.json";
import type { AppBindings, AppInstance } from "./types";

export const createApp = () => {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook: handleZodError,
	});
};

export const initOpenAPI = (app: AppInstance) => {
	app.doc("/docs/openapi", {
		openapi: "3.1.0",
		info: {
			version: packageJSON.version,
			title: packageJSON.description,
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
		Scalar({
			theme: "saturn",
			layout: "modern",
			url: "/docs/openapi",
		}),
	);

	return app;
};
