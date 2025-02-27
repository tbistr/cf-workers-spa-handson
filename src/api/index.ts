import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

type Bindings = {
	DB: D1Database;
};

export const api = new Hono<{ Bindings: Bindings }>();
api.use(logger());

const getMessages = async (db: D1Database) => {
	const r = await db
		.prepare("SELECT * FROM messages ORDER BY count ASC;")
		.all();
	return r.results;
};

const getMessage = async (message: string, db: D1Database) => {
	const r = await db
		.prepare("SELECT * FROM messages WHERE message = ?;")
		.bind(message)
		.first();
	return r;
};

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
		return c.json(await getMessages(c.env.DB));
	})
	.get("/messages/:message", async (c) => {
		const message = c.req.param("message");
		const r = await getMessage(message, c.env.DB);
		return c.json(r);
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
		const r = await getMessage(message, c.env.DB);
		return c.json(r);
	})
	.delete("/messages", async (c) => {
		await c.env.DB.prepare("DELETE FROM messages;").run();
		return c.json({ message: "All messages deleted" });
	});

export type AppType = typeof routes;
