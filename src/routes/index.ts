import { createApp } from "@/helpers/app.helpers";
import authRoutes from "./auth/auth.index";
import statusCheck from "./check/check.index";
import resourcesRoutes from "./resources/resources.index";
import resourceSharesRoutes from "./shares/shares.index";
import userRoutes from "./users/users.index";

const app = createApp()
	.route("/", statusCheck)
	.route("/auth", authRoutes)
	.route("/users", userRoutes)
	// .route("/resource-shares", resourceSharesRoutes)
	.route("/resources", resourcesRoutes);

export default app;
