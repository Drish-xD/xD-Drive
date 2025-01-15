import { createApp } from "@/helpers/app.helpers";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const app = createApp().openapi(routes.me, handlers.me);

export default app;
