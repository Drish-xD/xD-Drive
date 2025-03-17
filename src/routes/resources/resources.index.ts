import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./resources.handlers";
import * as routes from "./resources.routes";

const app = createApp()
	.openapi(routes.resources, handlers.resources)
	.openapi(routes.resource, handlers.resource)
	.openapi(routes.createFolder, handlers.createFolder)
	.openapi(routes.uploadFile, handlers.uploadFile)
	.openapi(routes.deleteResource, handlers.deleteResource);

export default app;
