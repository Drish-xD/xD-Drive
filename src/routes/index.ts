import { createApp } from "@/helpers/app.helpers";
import check from "./check/check.index";
// import auth from "./auth";
// import files from "./files";
// import folders from "./folders";
// import groups from "./groups";
// import shares from "./shares";
// import users from "./users";

// Mount all the routes to the app
const app = createApp().route("/", check);
// .route("/auth", auth)
// .route("/files", files)
// .route("/folders", folders)
// .route("/shares", shares)
// .route("/users", users)
// .route("/groups", groups);

export default app;
