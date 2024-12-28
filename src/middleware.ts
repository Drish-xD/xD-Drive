import { HTTP_STATUSES } from "@/constants";
import type { AppInstance } from "@/helpers/create-app";
import { type TError, handleError } from "@/helpers/errors";
import { logger } from "@/helpers/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

export const middleware = (app: AppInstance) => {
	app.use(cors());
	app.use(trimTrailingSlash());
	app.use(requestId());
	app.use(prettyJSON());
	app.use(logger());

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
};
