import { Hono } from "hono";

const app = new Hono();

app.post("/files/:id", async (ctx) => {
	// Share file with user/group
	return ctx.text("Hello, world!");
});

app.post("/folders/:id", async (ctx) => {
	// Share folder with user/group
	return ctx.text("Hello, world!");
});

app.post("/files/:id/public-link", async (ctx) => {
	// Create public sharing link for file
	return ctx.text("Hello, world!");
});

app.post("/folders/:id/public-link", async (ctx) => {
	// Create public sharing link for folder
	return ctx.text("Hello, world!");
});

app.put("/:id/access", async (ctx) => {
	// Update sharing permissions
	return ctx.text("Hello, world!");
});

app.delete("/:id", async (ctx) => {
	// Remove share
	return ctx.text("Hello, world!");
});

export default app;
