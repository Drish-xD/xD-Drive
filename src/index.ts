import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import routes from "./routes";

const app = new Hono();

// Middleware
app.use(prettyJSON());
app.use(trimTrailingSlash());
app.use(logger());

app.route("/api", routes);
app.get("/", (ctx) => ctx.text("Hello, World!"));

app.notFound((ctx) => {
	return ctx.json({
		status: "error",
		message: "Not found",
	});
});

app.onError((err, ctx) => {
	return ctx.json({
		status: "error",
		...err,
	});
});

export default app;
