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

// ===================================================================
import express from "express";
const app = express();

app.get("", (req, res) => {
  res.json(JSON.stringify({ msg: "test" }));
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
