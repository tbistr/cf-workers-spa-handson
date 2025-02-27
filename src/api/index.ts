import { Hono } from "hono";

type Bindings = {
	DB: D1Database;
};

export const api = new Hono<{ Bindings: Bindings }>();

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
		return c.json(r.results);
	})
	.post("/messages/:message", async (c) => {
		const message = c.req.param("message");
		console.log("message", message);
		await c.env.DB.prepare(
			"INSERT INTO messages (message, count) VALUES (?, COALESCE((SELECT MAX(count) + 1 FROM messages), 1));",
		)
			.bind(message)
			.run();
		return c.json({ message });
	});

export type AppType = typeof routes;
