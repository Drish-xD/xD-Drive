import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const app = createApp().openapi(routes.register, handlers.register).openapi(routes.login, handlers.login);

export default app;
