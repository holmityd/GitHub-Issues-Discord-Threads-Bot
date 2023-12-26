# Discord-Github Issues Integration

### Functionality

#### Issues
- [x] Discord post create -> Github issue create
- [ ] Github issue create -> Discord post create

#### Comments
- [x] Discord post comment add -> Github issue comment add
- [ ] Github issue comment add -> Discord post comment add

#### Tags
- [x] Discord post tags add -> Github issue labels add
- [ ] Discord post tag change -> Github issue label change
- [ ] Github issue label change -> Discord post tag change

#### Lock/Unlock
- [x] Discord post lock/unlock -> Github issue lock/unlock
- [ ] Github issue lock/unlock -> Discord post lock/unlock

#### Open/Close
- [x] Discord post open/close -> Github issue open/close
- [ ] Github issue open/close -> Discord post open/close

#### Delete
- [x] Discord post delete -> Github issue delete
- [ ] Github issue delete -> Discord post delete

#### Attachment Support
- [x] png
- [x] jpeg
- [ ] gif
- [ ] text
- [ ] video

### Install
#### Creating bot
Create bot https://discord.com/developers/applications?new_application=true

Bot settings: 
- PUBLIC BOT - [ ]
- PRESENCE INTENT - [x]
- MESSAGE CONTENT INTENT - [x]

Invite url: https://discord.com/api/oauth2/authorize?client_id=APPLICATION_ID&permissions=0&scope=bot

#### env
- DISCORD_TOKEN - Discord developer bot page "Settings->bot->reset token" (https://discord.com/developers/applications/APPLICATION_ID/bot)
- DISCORD_CHANNEL_ID - In Discord server create forum channel and RMB copy id
- GITHUB_ACCESS_TOKEN - "Settings->developer->personal acccess tokens" https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- GITHUB_USERNAME - example: https://github.com/<GITHUB_USERNAME>/<GITHUB_REPOSITORY>
- GITHUB_REPOSITORY

#### Start bot
```bash
npm run dev
```
or
```bash
npm run build && npm run start
```