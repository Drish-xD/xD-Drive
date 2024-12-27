import { Hono } from "hono";
import { logger } from "hono/logger";
import { db } from "./db";

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/health-check", async (ctx) => {
	try {
		const result = await db.execute("select 1");
		return ctx.json({
			status: "success",
			data: result?.rows,
		});
	} catch (error) {
		return ctx.json({
			status: "error",
			data: error,
		});
	}
});

export default app;
