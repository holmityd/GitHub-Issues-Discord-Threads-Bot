# Managing GitHub Issues via Discord Threads

This Discord bot serves as a seamless bridge between Discord thread channel and GitHub repository issues, enabling efficient issue management and synchronization between the two platforms. This integration allows for efficient project management, ensuring that actions performed on either Discord or GitHub are reflected in both platforms, facilitating smoother collaboration and issue tracking across teams.

## Functionality Overview

#### Issues

-   \[x] Discord Post Creation -> Automatically generates a corresponding GitHub issue.
-   \[ ] GitHub Issue Creation -> Pending feature: Creation of Discord posts from GitHub issues.

#### Comments

-   \[x] Discord Post Comments -> Mirrored as comments on associated GitHub issues.
-   \[ ] GitHub Issue Comments -> Pending feature: Synchronization with Discord post comments.

#### Tags & Labels

-   \[x] Discord Post Tags -> Translated into GitHub issue labels for better categorization.
-   \[ ] Discord Post Tag Changes -> Future implementation: Update GitHub issue labels from Discord.
-   \[ ] GitHub Issue Label Changes -> Future implementation: Reflect changes in Discord post tags from GitHub.

#### Locking & Unlocking

-   \[x] Discord Post Lock/Unlock -> Corresponding action on GitHub issues for security or access control.
-   \[ ] GitHub Issue Lock/Unlock -> Pending feature: Syncing locking status with Discord posts.

#### Open/Close Management

-   \[x] Discord Post Open/Close -> Triggers opening or closing of related GitHub issues.
-   \[ ] GitHub Issue Open/Close -> Future enhancement: Update Discord post status based on GitHub issue status.

#### Deletion Actions

-   \[x] Discord Post Deletion -> Initiates the removal of the associated GitHub issue.
-   \[ ] GitHub Issue Deletion -> Planned: Sync deletion actions from GitHub to Discord posts.

#### Attachment Support

-   \[x] Supported File Types: png, jpeg
-   \[ ] Planned Support: gif, text, video

## Installation Steps

#### Creating bot

Create bot https://discord.com/developers/applications?new_application=true

Bot settings:

-   \[x] PRESENCE INTENT
-   \[x] MESSAGE CONTENT INTENT

Invite url: https://discord.com/api/oauth2/authorize?client_id=APPLICATION_ID&permissions=0&scope=bot

#### env

-   DISCORD_TOKEN - Discord developer bot page "Settings->bot->reset token" (https://discord.com/developers/applications/APPLICATION_ID/bot)
-   DISCORD_CHANNEL_ID - In Discord server create forum channel and RMB copy id
-   GITHUB_ACCESS_TOKEN - "Settings->developer->personal acccess tokens" https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
-   GITHUB_USERNAME - example: https://github.com/<GITHUB_USERNAME>/<GITHUB_REPOSITORY>
-   GITHUB_REPOSITORY

#### Start bot

```bash
npm run dev
```

or

```bash
npm run build && npm run start
```
