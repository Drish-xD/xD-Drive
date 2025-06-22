import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./shares.handlers";
import * as routes from "./shares.routes";

const app = createApp().openapi(routes.home, handlers.home).openapi(routes.healthCheck, handlers.healthCheck);

export default app;
