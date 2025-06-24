import { createApp } from "@/helpers/app.helpers";
import activityRoutes from "./activity/activity.index";
import authRoutes from "./auth/auth.index";
import statusCheck from "./check/check.index";
import resourcesRoutes from "./resources/resources.index";
import sharesRoutes from "./shares/shares.index";
import userRoutes from "./users/users.index";

const app = createApp()
	.route("/", statusCheck)
	.route("/auth", authRoutes)
	.route("/users", userRoutes)
	.route("/shares", sharesRoutes)
	.route("/resources", resourcesRoutes)
	.route("/activity", activityRoutes);

export default app;
