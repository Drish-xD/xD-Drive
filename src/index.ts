import app from "@/app";
import { Config } from "@/config";

// Start the server
export default {
	port: Config.PORT,
	fetch: app.fetch,
};
