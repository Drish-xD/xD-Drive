import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./check.handlers";
import * as routes from "./check.routes";

const app = createApp().openapi(routes.healthCheck, handlers.healthCheck);

export default app;
