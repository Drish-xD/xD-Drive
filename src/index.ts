import { Config } from "@/config";
import { db } from "@/db";
import { createApp } from "@/helpers/create-app";
import { middleware } from "@/middleware";
import routes from "@/routes";
import { swaggerUI } from "@hono/swagger-ui";

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

app.get("/docs", swaggerUI({ url: "/doc" }));

const server = {
	port: Config.PORT,
	fetch: app.fetch,
};

export default server;
