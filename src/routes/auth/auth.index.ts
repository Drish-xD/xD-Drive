import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const app = createApp()
	.openapi(routes.register, handlers.register)
	.openapi(routes.login, handlers.login)
	.openapi(routes.refreshToken, handlers.refreshToken)
	.openapi(routes.logout, handlers.logout);

export default app;
