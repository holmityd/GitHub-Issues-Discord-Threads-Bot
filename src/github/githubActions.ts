import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import { config } from "../config";
import { GitIssue, Thread } from "../interfaces";
import { store } from "../store";
import { Attachment, Collection, Message } from "discord.js";
import {
  ActionValue,
  Actions,
  Triggerer,
  getGithubUrl,
  logger,
} from "../logger";

export const octokit = new Octokit({
  auth: config.GITHUB_ACCESS_TOKEN,
  baseUrl: "https://api.github.com",
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token  ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
});

export const repoCredentials = {
  owner: config.GITHUB_USERNAME,
  repo: config.GITHUB_REPOSITORY,
};

const info = (action: ActionValue, thread: Thread) =>
  logger.info(`${Triggerer.Discord} | ${action} | ${getGithubUrl(thread)}`);

function update(issue_number: number, state: "open" | "closed") {
  octokit.rest.issues.update({
    ...repoCredentials,
    issue_number,
    state,
  });
}

function attachmentsToMarkdown(attachments: Collection<string, Attachment>) {
  let md = "";
  attachments.forEach(({ url, name, contentType }) => {
    switch (contentType) {
      case "image/png":
      case "image/jpeg":
        md += `![${name}](${url} "${name}")`;
        break;
    }
  });
  return md;
}

function getIssueBody(params: Message) {
  const { guildId, channelId, id, content, author, attachments } = params;
  const { globalName, avatar } = author;

  return (
    `<kbd>[![${globalName}](https://cdn.discordapp.com/avatars/${author.id}/${avatar}.webp?size=40)](https://discord.com/channels/${guildId}/${channelId}/${id})</kbd> [${globalName}](https://discord.com/channels/${guildId}/${channelId}/${id})  \`BOT\`\n\n` +
    `${content}\n` +
    `${attachmentsToMarkdown(attachments)}\n`
  );
}

const regexForDiscordCredentials =
  /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)(?=\))/;
function formatIssuesToThreads(issues: GitIssue[]): Thread[] {
  const res: Thread[] = [];
  issues.forEach(({ title, body, number, node_id, locked, state }) => {
    const match = body.match(regexForDiscordCredentials);
    if (match && match.length === 4) {
      const id = match[2];
      // const [_, guildId, channelId, id] = match;
      res.push({
        id,
        title,
        number,
        body,
        node_id,
        locked,
        comments: [],
        appliedTags: [],
        archived: state === "closed",
      });
    }
  });
  return res;
}

export function closeIssue(thread: Thread) {
  const { number } = thread;
  if (!number) return;

  info(Actions.Closed, thread);

  update(number, "closed");
}

export function openIssue(thread: Thread) {
  const { number } = thread;
  if (!number) return;

  info(Actions.Reopened, thread);

  update(number, "open");
}

export function lockIssue(thread: Thread) {
  const { number } = thread;
  if (!number) return;

  info(Actions.Locked, thread);

  octokit.rest.issues.lock({
    ...repoCredentials,
    issue_number: number,
  });
}

export function unlockIssue(thread: Thread) {
  const { number } = thread;
  if (!number) return;

  info(Actions.Unlocked, thread);

  octokit.rest.issues.unlock({
    ...repoCredentials,
    issue_number: number,
  });
}

export function createIssue(thread: Thread, params: Message) {
  const { title, appliedTags, number } = thread;
  if (number) return;

  const labels = appliedTags?.map(
    (id) => store.availableTags.find((item) => item.id === id)?.name || "",
  );

  const body = getIssueBody(params);
  octokit.rest.issues
    .create({
      ...repoCredentials,
      labels,
      title,
      body,
    })
    .then((res) => {
      thread.node_id = res.data.node_id;
      thread.body = res.data.body!;
      thread.number = res.data.number;

      info(Actions.Created, thread);
    });
}

export function createIssueComment(thread: Thread, params: Message) {
  const body = getIssueBody(params);

  octokit.rest.issues
    .createComment({
      ...repoCredentials,
      issue_number: thread.number!,
      body,
    })
    .then((res) => {
      const git_id = res.data.id;
      const id = params.id;
      thread.comments.push({ id, git_id });
      info(Actions.Commented, thread);
    });
}

export function deleteIssue(thread: Thread) {
  const { node_id } = thread;
  if (!node_id) return;

  info(Actions.Deleted, thread);

  try {
    graphqlWithAuth(
      `mutation {deleteIssue(input: {issueId: "${node_id}"}) {clientMutationId}}`,
    );
  } catch (error) {
    // error("Error deleting issue:", error);
  }
}

export function deleteComment(thread: Thread, comment_id: number) {
  octokit.rest.issues.deleteComment({
    ...repoCredentials,
    comment_id,
  });
  info(Actions.DeletedComment, thread);
}

export async function getIssues() {
  const result = await octokit.rest.issues.listForRepo({
    ...repoCredentials,
    state: "all",
  });
  fillCommentsData();

  return formatIssuesToThreads(result.data as GitIssue[]);
}

function fillCommentsData() {
  octokit.rest.issues
    .listCommentsForRepo({
      ...repoCredentials,
    })
    .then(({ data }) => {
      data.forEach((comment) => {
        const match = comment.body?.match(regexForDiscordCredentials);
        const git_id = comment.id;
        if (match && match.length === 4) {
          const [, , channelId, id] = match;
          const thread = store.threads.find((i) => i.id === channelId);
          thread?.comments.push({ id, git_id });
        }
      });
    });
}
