import { createApp } from "@/helpers/app.helpers";
import authRoutes from "./auth/auth.index";
import statusCheck from "./check/check.index";
import permissionsRoutes from "./permissions/permissions.index";
import resourcesRoutes from "./resources/resources.index";
import userRoutes from "./users/users.index";

const app = createApp()
	.route("/", statusCheck)
	.route("/auth", authRoutes)
	.route("/users", userRoutes)
	.route("/permissions", permissionsRoutes)
	.route("/resources", resourcesRoutes);

export default app;
