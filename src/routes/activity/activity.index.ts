import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./activity.handlers";
import * as routes from "./activity.routes";

const app = createApp().openapi(routes.getUserActivityRoute, handlers.getUserActivity).openapi(routes.getResourceActivityRoute, handlers.getResourceActivity);

export default app;
