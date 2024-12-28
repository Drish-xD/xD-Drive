import { notFound } from "@/middleware";
import routes from "@/routes";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

const app = new OpenAPIHono();

// Middleware
app.use(requestId());
app.use(prettyJSON());
app.use(trimTrailingSlash());
app.use(logger());
app.use(cors());

// route
app.get("/", (ctx) => ctx.text("Hello, World!"));

app.route("/api", routes);

app.notFound(notFound);

app.onError((err, ctx) => {
	return ctx.json({
		status: "error",
		...err,
	});
});

export default app;
