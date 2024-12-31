import { Config } from "@/config";
import { createApp } from "@/helpers/create-app";
import { middleware } from "@/middleware";
import routes from "@/routes";
import { initOpenAPI } from "./helpers/create-docs";

const app = createApp();

middleware(app);
initOpenAPI(app);

app.get("/", (ctx) => ctx.text("Hello, World!")).route("/api", routes);

const server = {
	port: Config.PORT,
	fetch: app.fetch,
};

export default server;
