import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/me", async (ctx) => {
	// Get current user profile
	const userData = await db.query.users.findFirst({
		where: eq(users.id, "abc"),
	});
	return ctx.json(userData);
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
