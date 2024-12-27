import { Hono } from "hono";

const app = new Hono();

app.get("/", async (ctx) => {
	// List files (with pagination and filters)
	return ctx.text("Hello, world!");
});

app.post("/", async (ctx) => {
	// Upload new file
	return ctx.text("Hello, world!");
});

app.get("/:id", async (ctx) => {
	// Get file details
	return ctx.text("Hello, world!");
});

app.put("/:id", async (ctx) => {
	// Update file metadata
	return ctx.text("Hello, world!");
});

app.delete("/:id", async (ctx) => {
	// Delete file
	return ctx.text("Hello, world!");
});

app.get("/:id/content", async (ctx) => {
	// Download file content
	return ctx.text("Hello, world!");
});

export default app;
