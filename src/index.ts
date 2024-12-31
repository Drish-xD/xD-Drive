import { Config } from "@/config";
import { middleware } from "@/middleware";
import routes from "@/routes";
import { handle } from "hono/vercel";
import { createApp, initOpenAPI } from "./helpers/app.helpers";

const app = createApp().basePath("/api");

middleware(app);
initOpenAPI(app);

app.route("/", routes);

const server = {
	port: Config.PORT,
	fetch: app.fetch,
};

export default server;

// Export the handler for Vercel
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
