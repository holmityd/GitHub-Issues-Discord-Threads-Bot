import { Request } from "express";
import { store } from "./store";
import { ForumChannel, ThreadChannel } from "discord.js";
import { GitHubLabel, Thread } from "./interfaces";
import {
  ActionValue,
  Actions,
  Triggerer,
  getDiscordUrl,
  logger,
} from "./logger";
import { config } from "./config";

const info = (action: ActionValue, thread: Thread) =>
  logger.info(`${Triggerer.Github} | ${action} | ${getDiscordUrl(thread)}`);

export const githubActions: {
  // eslint-disable-next-line no-unused-vars
  [key: string]: (req: Request) => void;
} = {
  opened: (req) => {
    if (!req.body?.issue) return;
    const { node_id, number, title, user, body, labels } = req.body.issue;
    if (store.threads.some((thread) => thread.node_id === node_id)) return;

    const { login } = user;
    const appliedTags = (<GitHubLabel[]>labels)
      .map(
        (label) =>
          store.availableTags.find((tag) => tag.name === label.name)?.id || "",
      )
      .filter((i) => i);

    const forum = store.client?.channels.cache.get(
      config.DISCORD_CHANNEL_ID,
    ) as ForumChannel;
    forum.threads
      .create({
        message: {
          content: body + "/" + login, // TODO
        },
        name: title,
        appliedTags,
      })
      .then(({ id }) => {
        const thread = store.threads.find((thread) => thread.id === id);
        if (!thread) return;

        thread.body = body;
        thread.node_id = node_id;
        thread.number = number;

        info(Actions.Created, thread);
      });
  },
  created: (req) => {
    console.log("comment created", req.body);
  },
  closed: async (req) => {
    const { thread, channel } = await getThreadChannel(req);
    if (!thread || !channel || channel.archived) return;

    info(Actions.Closed, thread);

    thread.archived = true;
    channel.setArchived(true);
  },
  reopened: async (req) => {
    const { thread, channel } = await getThreadChannel(req);
    if (!thread || !channel || !channel.archived) return;

    info(Actions.Reopened, thread);

    thread.archived = false;
    channel.setArchived(false);
  },
  locked: async (req) => {
    const { thread, channel } = await getThreadChannel(req);
    if (!thread || !channel || channel.locked) return;

    info(Actions.Locked, thread);

    thread.locked = true;
    if (channel.archived) {
      thread.lockArchiving = true;
      thread.lockLocking = true;
      channel.setArchived(false);
      channel.setLocked(true);
      channel.setArchived(true);
    } else {
      channel.setLocked(true);
    }
  },
  unlocked: async (req) => {
    const { thread, channel } = await getThreadChannel(req);
    if (!thread || !channel || !channel.locked) return;

    info(Actions.Unlocked, thread);

    thread.locked = false;
    if (channel.archived) {
      thread.lockArchiving = true;
      thread.lockLocking = true;
      channel.setArchived(false);
      channel.setLocked(false);
      channel.setArchived(true);
    } else {
      channel.setLocked(false);
    }
  },
  deleted: async (req) => {
    const { channel, thread } = await getThreadChannel(req);
    if (!thread || !channel) return;

    info(Actions.Deleted, thread);

    store.deleteThread(thread?.id);
    channel.delete();
  },
};

async function getThreadChannel(req: Request): Promise<{
  channel: ThreadChannel<boolean> | undefined;
  thread: Thread | undefined;
}> {
  let channel: ThreadChannel<boolean> | undefined;
  const { issue } = req.body;
  if (!issue?.node_id) return { thread: undefined, channel };

  const thread = store.threads.find(
    (thread) => thread.node_id === issue.node_id,
  );
  if (!thread) return { thread, channel };

  channel = <ThreadChannel | undefined>(
    store.client?.channels.cache.get(thread.id)
  );
  if (channel) return { thread, channel };

  try {
    channel = await (<ThreadChannel | undefined>(
      store.client?.channels.fetch(thread.id)
    ));
  } catch (err) {
    /* empty */
  }

  return { thread, channel };
}
