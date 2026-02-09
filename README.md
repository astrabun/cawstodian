# 🐦‍⬛ Cawstodian

> a lil Discord screening bot

## Configuration

### Required Environment Variables

In a .env file (or elsewhere in your environment), set:

- DISCORD_CLIENT_ID - Bot Client ID
- DISCORD_BOT_TOKEN - Bot Token

These are required for the bot to function.

### Optional Environment Veriables

| Variable                        | Purpose |
| ------------------------------- | ------- |
| DISCORD_FAILED_TO_DM_CHANNEL_ID | If you'd prefer challenges for users who have DMs disabled sent to a custom channel rather than the server's system messages channel, copy the ID of the custom channel and set this variable. |
