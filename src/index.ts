import { Config } from "@/config";
import { db } from "@/db";
import { createApp } from "@/helpers/create-app";
import { middleware } from "@/middleware";
import routes from "@/routes";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import packageJSON from "../package.json";

const app = createApp();

middleware(app);

app.get("/", (ctx) => ctx.text("Hello, World!"));

app.get("/health", async (ctx) => {
	const data = await db.execute("select 1");
	return ctx.json({
		message: "API and DB connection is healthy",
		data,
	});
});

app.route("/api", routes);

app.get("/ui", swaggerUI({ url: "/doc" }));

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

app.get(
	"/docs",
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

const server = {
	port: Config.PORT,
	fetch: app.fetch,
};

export default server;
