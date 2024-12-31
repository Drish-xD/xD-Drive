import { HTTP_STATUSES } from "@/constants";
import { db } from "@/db";
import { handleError } from "@/helpers/errors.helpers";
import type { AppInstance, TError } from "@/helpers/types";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { logger } from "./logger";

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

	app.notFound((ctx) =>
		ctx.json<TError>({
			code: HTTP_STATUSES.NOT_FOUND.KEY,
			message: HTTP_STATUSES.NOT_FOUND.PHRASE,
			details: {
				path: ctx.req.path,
				method: ctx.req.method,
			},
		}),
	);

	app.onError(handleError);

	return app;
};
