import { Hono } from "hono/quick";
import { getLatestVersions, getPlatformDownloads, getStars } from "../utils.js";

type Bindings = {
	GITHUB_TOKEN: string;
	BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/stars", async (c) => {
	const response = await getStars({
		authToken: c.env.GITHUB_TOKEN,
	});

	return c.body(JSON.stringify(response), 200, {
		"Content-Type": "application/json",
		"Cache-Control": "max-age=300",
	});
});

app.get("/latest", async (c) => {
	const response = await getPlatformDownloads({
		authToken: c.env.GITHUB_TOKEN,
	});

	if (!response) {
		return c.body(
			JSON.stringify({
				downloads: [],
				latestVersion: "",
			}),
			500,
			{
				"Content-Type": "application/json",
			},
		);
	}

	return c.body(
		JSON.stringify({
			downloads: response.versions,
			latestVersion: response.latestVersion,
		}),
		200,
		{
			"Content-Type": "application/json",
		},
	);
});

app.get("/canary", async (c) => {
	const files = await c.env.BUCKET.list({
		prefix: "mac/",
	});

	// get the latest canary build for each platform

	return c.body(
		JSON.stringify({
			downloads: [],
			latestVersion: "v0.0.0",
		}),
		200,
		{
			"Content-Type": "application/json",
		},
	);
});

app.get("/:target/:arch/:currentVersion", async (c) => {
	// TODO: updater metrics maybe?
	const currentVersion = c.req.param("currentVersion");

	try {
		const latestVersion = await getLatestVersions({
			authToken: c.env.GITHUB_TOKEN,
		});

		if (currentVersion === latestVersion?.version) {
			return c.body("", 204, {
				"Content-Type": "application/json",
			});
		}

		return c.body(JSON.stringify(latestVersion), 200, {
			"Content-Type": "application/json",
		});
	} catch (e) {
		return c.body(JSON.stringify(e), 500, {
			"Content-Type": "application/json",
		});
	}
});

export default app;
