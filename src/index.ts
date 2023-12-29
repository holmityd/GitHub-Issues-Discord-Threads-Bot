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
import { githubActions } from "./githubHandlers";
const app = express();

app.use(express.json());

app.get("", (req, res) => {
  res.json(JSON.stringify({ msg: "test" }));
});

app.post("/", (req, res) => {
  const githubAction = githubActions[req.body.action];
  githubAction && githubAction(req);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
