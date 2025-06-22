import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { db } from "@/db";
import type { AppInstance } from "@/helpers/types";
import { setUserDataFromAccessToken, setUserDataFromRefreshToken, verifyAccessToken, verifyRefreshToken } from "./auth.middleware";
import { serveFavicon } from "./favicon.middleware";
import { logger } from "./logger.middleware";
import { notFound } from "./not-found.middleware";
import { onError } from "./on-error.middleware";

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

	app.use(verifyAccessToken());
	app.use(setUserDataFromAccessToken());

	app.use("/auth/refresh-token", verifyRefreshToken());
	app.use("/auth/refresh-token", setUserDataFromRefreshToken());

	app.notFound(notFound);

	app.onError(onError);

	return app;
};
