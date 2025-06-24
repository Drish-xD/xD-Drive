import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { handleZodError } from "@/middleware/on-error.middleware";
import packageJSON from "../../package.json";
import type { AppBindings, AppInstance } from "./types";

export const createApp = () => {
	return new OpenAPIHono<AppBindings>({
		defaultHook: handleZodError,
		strict: false,
	});
};

export const initOpenAPI = (app: AppInstance) => {
	app.doc("/docs/openapi", {
		info: {
			contact: packageJSON.author,
			description: packageJSON.description,
			license: {
				name: packageJSON.license,
				url: "https://opensource.org/license/gpl-3-0",
			},
			title: packageJSON.description,
			version: packageJSON.version,
		},
		openapi: "3.1.0",
	});

	// initialize the API reference
	app.get(
		"/docs",
		Scalar({
			layout: "classic",
			theme: "saturn",
			url: "/docs/openapi",
		}),
	);

	return app;
};
