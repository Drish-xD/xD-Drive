import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./shares.handlers";
import * as routes from "./shares.routes";

const app = createApp()
	.openapi(routes.createShareLink, handlers.createShareLink)
	.openapi(routes.getShareLink, handlers.getShareLink)
	.openapi(routes.deleteShareLink, handlers.deleteShareLink)
	.openapi(routes.createShareEmail, handlers.createShareEmail)
	.openapi(routes.deleteShareEmail, handlers.deleteShareEmail)
	.openapi(routes.getResourcePermissions, handlers.getResourcePermissions);

export default app;
