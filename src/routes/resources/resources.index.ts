import { createApp } from "@/helpers/app.helpers";
import * as resourceHandlers from "./resource.handlers";
import * as resourceRoutes from "./resource.routes";
import * as resourcesHandlers from "./resources.handlers";
import * as resourcesRoutes from "./resources.routes";

const app = createApp()
	.openapi(resourcesRoutes.resources, resourcesHandlers.resources)
	.openapi(resourcesRoutes.getResourceChildren, resourcesHandlers.getResourceChildren)

	.openapi(resourceRoutes.createFolder, resourceHandlers.createFolder)
	.openapi(resourceRoutes.uploadFile, resourceHandlers.uploadFile)
	.openapi(resourceRoutes.downloadResource, resourceHandlers.downloadResource)
	.openapi(resourceRoutes.resource, resourceHandlers.resource)
	.openapi(resourceRoutes.renameResource, resourceHandlers.renameResource)
	.openapi(resourceRoutes.moveFile, resourceHandlers.moveFile)
	.openapi(resourceRoutes.deleteResource, resourceHandlers.deleteResource)
	.openapi(resourceRoutes.archiveResource, resourceHandlers.archiveResource)
	.openapi(resourceRoutes.restoreResource, resourceHandlers.restoreResource);

export default app;
