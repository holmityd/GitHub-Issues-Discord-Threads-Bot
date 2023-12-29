import { Request } from "express";
import { store } from "./store";
import { ThreadChannel } from "discord.js";
import { Thread } from "./interfaces";

export const githubActions: {
  // eslint-disable-next-line no-unused-vars
  [key: string]: (req: Request) => void;
} = {
  opened: (req) => {
    console.log("issue created", req.body);
  },
  created: (req) => {
    console.log("comment created", req.body);
  },
  closed: async (req) => {
    const { channel } = await getThreadChannel(req);
    if (!channel || channel.archived) return;
    console.log("github->discord", "close");
    channel.setArchived(true);
  },
  reopened: async (req) => {
    const { channel } = await getThreadChannel(req);
    if (!channel || !channel.archived) return;
    console.log("github->discord", "open");
    channel.setArchived(false);
  },
  locked: async (req) => {
    const { thread, channel } = await getThreadChannel(req);
    if (!thread || !channel || channel.locked) return;
    console.log("github->discord", "lock");
    // TODO - fix archived issue locking
    if (channel.archived) {
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
    console.log("github->discord", "unlock");
    if (channel.archived) {
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
    console.log("github->discord", "delete");
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
