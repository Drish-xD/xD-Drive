import { db } from "@/db";
import { handleError } from "@/helpers/errors.helpers";
import type { AppInstance } from "@/helpers/types";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { serveFavicon } from "./favicon";
import { logger } from "./logger";
import { notFound } from "./not-found";

export const middleware = (app: AppInstance) => {
	app.use(async (ctx, next) => {
		ctx.set("db", db);
		await next();
	});

	app.use(trimTrailingSlash());
	app.use(requestId());
	app.use(logger());
	app.use(cors());
	app.use(prettyJSON());
	app.use(serveFavicon("💻"));

	app.notFound(notFound);

	app.onError(handleError);

	return app;
};
