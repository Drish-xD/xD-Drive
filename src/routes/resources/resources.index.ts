import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./resources.handlers";
import * as routes from "./resources.routes";

const app = createApp()
	.openapi(routes.resources, handlers.resources)
	.openapi(routes.getResourceChildren, handlers.getResourceChildren)
	.openapi(routes.resource, handlers.resource)
	.openapi(routes.updateResource, handlers.updateResource)
	.openapi(routes.deleteResource, handlers.deleteResource)
	.openapi(routes.createFolder, handlers.createFolder)
	.openapi(routes.uploadFile, handlers.uploadFile)
	.openapi(routes.downloadResource, handlers.downloadResource);
// .openapi(routes.getResourceVersions, handlers.getResourceVersions)
// .openapi(routes.uploadNewVersion, handlers.uploadNewVersion)
// .openapi(routes.downloadResourceVersion, handlers.downloadResourceVersion)
// .openapi(routes.updateResourceVisibility, handlers.updateResourceVisibility)
// .openapi(routes.getResourceAccess, handlers.getResourceAccess);

export default app;
