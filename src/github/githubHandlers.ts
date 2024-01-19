import { Request } from "express";
import {
  archiveThread,
  createComment,
  createThread,
  deleteThread,
  lockThread,
  unarchiveThread,
  unlockThread,
} from "../discord/discordActions";
import { GitHubLabel } from "../interfaces";
import { store } from "../store";
import { getDiscordInfoFromGithubBody } from "./githubActions";

async function getIssueNodeId(req: Request): Promise<string | undefined> {
  return req.body.issue.node_id;
}

export async function handleOpened(req: Request) {
  if (!req.body.issue) return;
  const { node_id, number, title, user, body, labels } = req.body.issue;
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

export async function handleCreated(req: Request) {
  const { user, id, body } = req.body.comment;
  const { login, avatar_url } = user;
  const { node_id } = req.body.issue;

  // Check if the comment already contains Discord info
  if (getDiscordInfoFromGithubBody(body).channelId) {
    // If it does, stop processing (assuming created with a bot)
    return;
  }

  createComment({
    git_id: id,
    body,
    login,
    avatar_url,
    node_id,
  });
}

export async function handleClosed(req: Request) {
  const node_id = await getIssueNodeId(req);
  archiveThread(node_id);
}

export async function handleReopened(req: Request) {
  const node_id = await getIssueNodeId(req);
  unarchiveThread(node_id);
}

export async function handleLocked(req: Request) {
  const node_id = await getIssueNodeId(req);
  lockThread(node_id);
}

export async function handleUnlocked(req: Request) {
  const node_id = await getIssueNodeId(req);
  unlockThread(node_id);
}

export async function handleDeleted(req: Request) {
  const node_id = await getIssueNodeId(req);
  deleteThread(node_id);
}
