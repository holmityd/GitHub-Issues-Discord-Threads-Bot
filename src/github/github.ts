import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { GithubHandlerFunction } from "../interfaces";
import {
  handleClosed,
  handleCreated,
  handleDeleted,
  handleLocked,
  handleOpened,
  handleReopened,
  handleUnlocked,
} from "./githubHandlers";

const app = new Hono();

export function initGithub() {
  app.get("", (c) => {
    c.req;
    return c.json(JSON.stringify({ msg: "github webhooks work" }));
  });

  const githubActions: {
    [key: string]: GithubHandlerFunction;
  } = {
    opened: (req) => handleOpened(req),
    created: (req) => handleCreated(req),
    closed: (req) => handleClosed(req),
    reopened: (req) => handleReopened(req),
    locked: (req) => handleLocked(req),
    unlocked: (req) => handleUnlocked(req),
    deleted: (req) => handleDeleted(req),
  };

  app.post("/", async (c) => {
    const body = await c.req.json();
    const githubAction = githubActions[body.action];
    githubAction && githubAction(c.req);
    return c.json({ msg: "ok" });
  });

  const port = parseInt(process.env.PORT + "") || 5000;
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
