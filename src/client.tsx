import { hc } from "hono/client";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { AppType } from "./api";

const client = hc<AppType>("/api");

function App() {
	return (
		<>
			<h1>Hello, Hono with React!</h1>
			<h2>Example of useState</h2>
			<Counter />
			<h2>Example of API fetch</h2>
			<ClockButton />

			<h1>Example of working with the database</h1>
			<h2>Post a message</h2>
			<PostMessage />
			<h2>Get all messages</h2>
			<GetMessages />
		</>
	);
}

function Counter() {
	const [count, setCount] = useState(0);
	return (
		<button type="button" onClick={() => setCount(count + 1)}>
			You clicked me {count} times
		</button>
	);
}

const ClockButton = () => {
	const [response, setResponse] = useState<string | null>(null);

	const handleClick = async () => {
		const res = await client.clock.$get();
		const data = res.ok ? await res.json() : "Error fetching time";
		setResponse(JSON.stringify(data, null, 2));
	};

	return (
		<div>
			<button type="button" onClick={handleClick}>
				Get Server Time
			</button>
			{response && <pre>{response}</pre>}
		</div>
	);
};

const PostMessage = () => {
	const [message, setMessage] = useState("");
	const [response, setResponse] = useState<string | null>(null);

	const handleClick = async () => {
		const res = await client.messages[":message"].$post({ param: { message } });
		const data = res.ok ? await res.json() : "Error posting message";
		setResponse(data);
	};

	return (
		<div>
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button type="button" onClick={handleClick}>
				Post Message
			</button>
			{response && <pre>{JSON.stringify(response, null, 2)}</pre>}
		</div>
	);
};

const GetMessages = () => {
	const [response, setResponse] = useState<string | null>(null);

	const handleClick = async () => {
		const res = await client.messages.$get();
		const data = res.ok ? await res.json() : "Error fetching messages";
		setResponse(data);
	};

	return (
		<div>
			<button type="button" onClick={handleClick}>
				Get Messages
			</button>
			{response && <pre>{JSON.stringify(response, null, 2)}</pre>}
		</div>
	);
};

const root = createRoot(document.getElementById("root") ?? document.body);
root.render(<App />);
