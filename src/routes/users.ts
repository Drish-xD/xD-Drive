import { Hono } from "hono";

const app = new Hono();

app.get("/me", async (ctx) => {
	// Get current user profile
	return ctx.text("Hello, world!");
});

app.put("/me", async (ctx) => {
	// Update current user profile
	return ctx.text("Hello, world!");
});

app.get("/me/shares", async (ctx) => {
	// List resources shared with me
	return ctx.text("Hello, world!");
});

app.get("/me/shared", async (ctx) => {
	// List resources I've shared
	return ctx.text("Hello, world!");
});

export default app;
