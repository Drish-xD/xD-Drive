import { Hono } from "hono";

const app = new Hono();

app.get("/", async (ctx) => {
	// List groups
	return ctx.text("Hello, world!");
});

app.post("/", async (ctx) => {
	// Create new group
	return ctx.text("Hello, world!");
});

app.get("/:id", async (ctx) => {
	// Get group details
	return ctx.text("Hello, world!");
});

app.put("/:id", async (ctx) => {
	// Update group
	return ctx.text("Hello, world!");
});

app.delete("/:id", async (ctx) => {
	// Delete group
	return ctx.text("Hello, world!");
});

app.post("/:id/members", async (ctx) => {
	// Add group members
	return ctx.text("Hello, world!");
});

app.delete("/:id/members/:userId", async (ctx) => {
	// Remove group member
	return ctx.text("Hello, world!");
});

export default app;
