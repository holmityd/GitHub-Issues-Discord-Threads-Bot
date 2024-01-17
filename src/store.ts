import { GuildForumTag } from "discord.js";
import { Thread } from "./interfaces";

class Store {
  threads: Thread[] = [];
  availableTags: GuildForumTag[] = [];

  deleteThread(id: string | undefined) {
    const index = this.threads.findIndex((obj) => obj.id === id);
    if (index !== -1) {
      this.threads.splice(index, 1);
    }
    return this.threads;
  }
}

export const store = new Store();
