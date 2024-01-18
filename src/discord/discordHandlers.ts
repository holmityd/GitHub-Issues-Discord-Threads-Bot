import {
  AnyThreadChannel,
  Client,
  DMChannel,
  ForumChannel,
  Message,
  NonThreadGuildBasedChannel,
  PartialMessage,
  ThreadChannel,
} from "discord.js";
import { config } from "../config";
import {
  closeIssue,
  createIssue,
  createIssueComment,
  deleteComment,
  deleteIssue,
  getIssues,
  lockIssue,
  openIssue,
  unlockIssue,
} from "../github/githubActions";
import { logger } from "../logger";
import { store } from "../store";
import client from "./discord";

export async function handleClientReady(client: Client) {
  logger.info(`Logged in as ${client.user?.tag}!`);

  store.threads = await getIssues();

  // Fetch cache for closed threads
  store.threads.forEach((thread) => {
    const cachedChannel = <ThreadChannel | undefined>(
      client.channels.cache.get(thread.id)
    );
    cachedChannel?.messages.cache.map((message) => message.id);
    if (!cachedChannel) {
      client.channels.fetch(thread.id).then((ch) => {
        (ch as ThreadChannel).messages.cache.map((message) => message.id);
      });
    }
  });

  logger.info(`Issues loaded : ${store.threads.length}`);

  client.channels.fetch(config.DISCORD_CHANNEL_ID).then((params) => {
    store.availableTags = (params as ForumChannel).availableTags;
  });
}

export async function handleThreadCreate(params: AnyThreadChannel) {
  if (params.parentId !== config.DISCORD_CHANNEL_ID) return;

  const { id, name, appliedTags } = params;

  store.threads.push({
    id,
    appliedTags,
    title: name,
    archived: false,
    locked: false,
    comments: [],
  });
}

export async function handleChannelUpdate(
  params: DMChannel | NonThreadGuildBasedChannel,
) {
  if (params.id !== config.DISCORD_CHANNEL_ID) return;

  if (params.type === 15) {
    store.availableTags = params.availableTags;
  }
}

export async function handleThreadUpdate(params: AnyThreadChannel) {
  if (params.parentId !== config.DISCORD_CHANNEL_ID) return;

  const { id, archived, locked } = params.members.thread;
  const thread = store.threads.find((item) => item.id === id);
  if (!thread) return;

  if (thread.locked !== locked && !thread.lockLocking) {
    if (thread.archived) {
      thread.lockArchiving = true;
    }
    thread.locked = locked;
    locked ? lockIssue(thread) : unlockIssue(thread);
  }
  if (thread.archived !== archived) {
    setTimeout(() => {
      // timeout for fixing discord archived post locking
      if (thread.lockArchiving) {
        if (archived) {
          thread.lockArchiving = false;
        }
        thread.lockLocking = false;
        return;
      }
      thread.archived = archived;
      archived ? closeIssue(thread) : openIssue(thread);
    }, 500);
  }
}

export async function handleMessageCreate(params: Message) {
  const { channelId, author } = params;
  const { username, discriminator } = author;

  if (client.user?.tag === `${username}#${discriminator}`) return;

  const thread = store.threads.find((thread) => thread.id === channelId);

  if (!thread) return;

  if (!thread.body) {
    createIssue(thread, params);
  } else {
    createIssueComment(thread, params);
  }
}

export async function handleMessageDelete(params: Message | PartialMessage) {
  const { channelId, id } = params;
  const thread = store.threads.find((i) => i.id === channelId);
  if (!thread) return;

  const commentIndex = thread.comments.findIndex((i) => i.id === id);
  if (commentIndex === -1) return;

  const comment = thread.comments.splice(commentIndex, 1)[0];
  deleteComment(thread, comment.git_id);
}

export async function handleThreadDelete(params: AnyThreadChannel) {
  if (params.parentId !== config.DISCORD_CHANNEL_ID) return;

  const thread = store.threads.find((item) => item.id === params.id);
  if (!thread) return;

  deleteIssue(thread);
}
