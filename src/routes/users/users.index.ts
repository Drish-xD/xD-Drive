import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const app = createApp()
	.openapi(routes.currentUser, handlers.currentUser)
	.openapi(routes.updateCurrentUser, handlers.updateCurrentUser)
	.openapi(routes.deleteCurrentUser, handlers.deleteCurrentUser)
	.openapi(routes.users, handlers.users)
	.openapi(routes.user, handlers.user);

export default app;
