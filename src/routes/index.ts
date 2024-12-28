import { Hono } from "hono";
import authRoutes from "./auth";
import fileRoutes from "./files";
import folderRoutes from "./folders";
import groupRoutes from "./groups";
import shareRoutes from "./shares";
import userRoutes from "./users";

const app = new Hono();

// Mount routes
app.route("/auth", authRoutes);
app.route("/files", fileRoutes);
app.route("/folders", folderRoutes);
app.route("/shares", shareRoutes);
app.route("/users", userRoutes);
app.route("/groups", groupRoutes);

export default app;
