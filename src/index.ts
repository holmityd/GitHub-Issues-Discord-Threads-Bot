import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import {
  handleChannelUpdate,
  handleClientReady,
  handleMessageCreate,
  handleThreadCreate,
  handleThreadDelete,
  handleThreadUpdate,
} from "./discordHandlers";
import { store } from "./store";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});
store.client = client;

client.once(Events.ClientReady, handleClientReady);
client.on(Events.ThreadCreate, handleThreadCreate);
client.on(Events.ThreadUpdate, handleThreadUpdate);
client.on(Events.ChannelUpdate, handleChannelUpdate);
client.on(Events.MessageCreate, handleMessageCreate);
client.on(Events.ThreadDelete, handleThreadDelete);

client.login(config.DISCORD_TOKEN);
