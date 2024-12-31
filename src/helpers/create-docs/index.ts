import type { AppInstance } from "@/helpers/create-app";
import { apiReference } from "@scalar/hono-api-reference";
import packageJSON from "../../../package.json";

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
			theme: "kepler",
			layout: "modern",
			defaultHttpClient: {
				targetKey: "javascript",
				clientKey: "fetch",
			},
			spec: {
				url: "/doc",
			},
		}),
	);

	return app;
};
