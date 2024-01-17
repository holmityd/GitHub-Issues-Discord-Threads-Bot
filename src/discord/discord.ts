import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "../config";
import { store } from "../store";
import {
  handleChannelUpdate,
  handleClientReady,
  handleMessageCreate,
  handleThreadCreate,
  handleThreadDelete,
  handleThreadUpdate,
} from "./discordHandlers";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});
store.client = client;

export function initDiscord() {
  client.once(Events.ClientReady, handleClientReady);
  client.on(Events.ThreadCreate, handleThreadCreate);
  client.on(Events.ThreadUpdate, handleThreadUpdate);
  client.on(Events.ChannelUpdate, handleChannelUpdate);
  client.on(Events.MessageCreate, handleMessageCreate);
  client.on(Events.ThreadDelete, handleThreadDelete);

  client.login(config.DISCORD_TOKEN);
}

export default client;
