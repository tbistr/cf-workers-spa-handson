import { Hono } from "hono";
import { logger } from "hono/logger";

type Bindings = {
	DB: D1Database;
};

export const api = new Hono<{ Bindings: Bindings }>();
api.use(logger());

const routes = api
	.get("/clock", (c) => {
		return c.json({
			time: new Date().toISOString(),
		});
	})
	.get("/hello", (c) => {
		return c.json({
			message: "Hello, World!",
		});
	})
	.get("/messages", async (c) => {
		const r = await c.env.DB.prepare(
			"SELECT * FROM messages ORDER BY count ASC;",
		).all();
		return c.json(
			r.results.map((row) => ({ message: row.message, count: row.count })),
		);
	})
	.post("/messages/:message", async (c) => {
		const message = c.req.param("message");
		await c.env.DB.prepare(
			`INSERT INTO messages (message, count)
			VALUES (?, 1)
			ON CONFLICT(message) DO UPDATE 
			SET count = count + 1;`,
		)
			.bind(message)
			.run();
		return c.json({ message });
	})
	.delete("/messages", async (c) => {
		await c.env.DB.prepare("DELETE FROM messages;").run();
		return c.json({ message: "All messages deleted" });
	});

export type AppType = typeof routes;
