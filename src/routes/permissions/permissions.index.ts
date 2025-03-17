import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./permissions.handlers";
import * as routes from "./permissions.routes";

const app = createApp().openapi(routes.home, handlers.home).openapi(routes.healthCheck, handlers.healthCheck);

export default app;
