import { Client, GuildForumTag } from "discord.js";
import { Thread } from "./interfaces";

class Store {
  client?: Client;
  threads: Thread[] = [];
  availableTags: GuildForumTag[] = [];
}

export const store = new Store();
