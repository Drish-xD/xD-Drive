import { HTTP_STATUSES } from "@/constants";
import type { AppRouteHandler } from "@/helpers/types";
import type { THealthCheckRoute, THomeRoute } from "./shares.routes";

export const healthCheck: AppRouteHandler<THealthCheckRoute> = async (ctx) => {
	const { command, rowCount } = await ctx.get("db").execute("Select 1");

	return ctx.json(
		{
			message: "API and DB connection is healthy",
			data: {
				command,
				rowCount,
			},
		},
		HTTP_STATUSES.OK.CODE,
	);
};

export const home: AppRouteHandler<THomeRoute> = (ctx) => {
	return ctx.json(
		{
			message: "Hello World!",
		},
		HTTP_STATUSES.OK.CODE,
	);
};
