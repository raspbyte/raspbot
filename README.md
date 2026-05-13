# raspbot

A personal Discord bot built on [discord.js](https://discord.js.org/). Includes rock paper scissors, a magic 8-ball, a bully command, dice rolling, cat posting, and a voice channel audio player.

---

## Features

The bot posts the hottest image from [r/cats](https://reddit.com/r/cats/) daily at 6:00 PM Pacific in the configured channel. It replies to messages that begin with "I am," "I'm," or "Im" (case insensitive) with "Hi ___, I'm raspbot," and it responds to the following commands:

| Command | Description |
|---|---|
| `/cat` | Post the hottest image from r/cats |
| `/play` | Play a sound in an active voice channel |
| `/rps rock\|paper\|scissors` | Start a game of rock paper scissors |
| `!8ball` | Ask the magic 8-ball a question |
| `!bully @user` | Set a bully target |
| `!target` | Check the current bully target |
| `!stop` | Clear the bully target |
| `!roll NdN` | Roll dice in standard notation (e.g. `2d6` or `1d20`) |

While a bully target is set, the bot reacts to their messages with a random set from `reactionSets` (app.js) and has a 5% chance to follow up with a direct message from `BULLY_MESSAGES` (.env).

---

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from the Developer Portal |
| `APP_ID` | Application ID from the Developer Portal |
| `PUBLIC_KEY` | Public key from the Developer Portal |
| `CAT_CHANNEL_ID` | Daily cat post channel ID |
| `BULLY_MESSAGES` | Pipe-separated messages (e.g. `msg one\|msg two`) |

---

## Permissions

### OAuth2 URL Generator → Bot Permissions

- View Channels
- Send Messages
- Send Messages in Threads
- Embed Links
- Read Message History
- Add Reactions
- Connect
- Speak

### Bot → Privileged Gateway Intents

- Server Members Intent
- Message Content Intent

---

## Credits

- Built on top of [Discord's sample app](https://github.com/discord/discord-example-app)
- Bully command inspired by [Joon on YouTube](https://www.youtube.com/watch?v=JOuzkiOBuV4) — [code](https://gist.github.com/JoonTorareta/c8171761d21f5c055b2f70834208aee1)
