import { middleware } from "@/middleware";
import routes from "@/routes";
import { createApp, initOpenAPI } from "./helpers/app.helpers";

const app = createApp();

middleware(app);

initOpenAPI(app);

app.route("/", routes);

export default app;
