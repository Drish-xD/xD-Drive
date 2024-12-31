import { handleZodError } from "@/helpers/errors.helpers";
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
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			title: "Google Drive API",
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
		"/reference",
		apiReference({
			theme: "deepSpace",
			layout: "modern",
			spec: {
				url: "/doc",
			},
		}),
	);

	return app;
};
