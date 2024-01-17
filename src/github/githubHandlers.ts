import { HonoRequest } from "hono";
import {
  archiveThread,
  createThread,
  deleteThread,
  lockThread,
  unarchiveThread,
  unlockThread,
} from "../discord/discordActions";
import { GitHubLabel } from "../interfaces";
import { store } from "../store";

async function getIssueNodeId(req: HonoRequest): Promise<string | undefined> {
  const reqBody = await req.json();
  return reqBody.issue.node_id;
}

export async function handleOpened(req: HonoRequest) {
  const reqBody = await req.json();
  if (!reqBody.issue) return;
  const { node_id, number, title, user, body, labels } = reqBody.issue;
  if (store.threads.some((thread) => thread.node_id === node_id)) return;

  const { login } = user;
  const appliedTags = (<GitHubLabel[]>labels)
    .map(
      (label) =>
        store.availableTags.find((tag) => tag.name === label.name)?.id || "",
    )
    .filter((i) => i);

  createThread({ login, appliedTags, number, title, body, node_id });
}

export async function handleCreated(req: HonoRequest) {
  const reqBody = await req.json();
  console.log("comment created", reqBody);
}

export async function handleClosed(req: HonoRequest) {
  const node_id = await getIssueNodeId(req);
  archiveThread(node_id);
}

export async function handleReopened(req: HonoRequest) {
  const node_id = await getIssueNodeId(req);
  unarchiveThread(node_id);
}

export async function handleLocked(req: HonoRequest) {
  const node_id = await getIssueNodeId(req);
  lockThread(node_id);
}

export async function handleUnlocked(req: HonoRequest) {
  const node_id = await getIssueNodeId(req);
  unlockThread(node_id);
}

export async function handleDeleted(req: HonoRequest) {
  const node_id = await getIssueNodeId(req);
  deleteThread(node_id);
}
