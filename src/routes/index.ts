import { createApp } from "@/helpers/app.helpers";
import auth from "./auth/auth.index";
import check from "./check/check.index";
import users from "./users/users.index";
// import files from "./files";
// import folders from "./folders";
// import groups from "./groups";
// import shares from "./shares";

// Mount all the routes to the app
const app = createApp().route("/", check).route("/auth", auth).route("/users", users);
// .route("/files", files)
// .route("/folders", folders)
// .route("/shares", shares)
// .route("/users", users)
// .route("/groups", groups);

export default app;
