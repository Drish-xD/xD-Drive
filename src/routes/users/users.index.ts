import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const app = createApp()
	.openapi(routes.me, handlers.me)
	.openapi(routes.users, handlers.users)
	.openapi(routes.user, handlers.user)
	.openapi(routes.updateUser, handlers.updateUser)
	.openapi(routes.deleteUser, handlers.deleteUser);

export default app;
