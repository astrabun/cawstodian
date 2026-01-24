import {Client, GatewayIntentBits, GuildMember} from 'discord.js';
import {env} from './env.js';
import {commands} from './commands/index.js';
import {deployCommands} from './deploy-commands.js';
import handleGuildMemberAdd from './eventHandlers/handle-guild-member-add.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
	],
});

client.once('clientReady', () => {
	console.log('Discord bot is ready! 🤖');
});

client.on('guildCreate', async guild => {
	await deployCommands({guildId: guild.id});
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) {
		return;
	}

	const {commandName} = interaction;
	const command = commands[commandName as keyof typeof commands] as {execute: (interaction: any) => unknown} | undefined;
	if (command) {
		await command.execute(interaction);
	}
});

// DEBUG TEST VALUE FOR MEMBER: <@1176911881903013898>
client.on('guildMemberAdd', handleGuildMemberAdd);

void client.login(env.DISCORD_BOT_TOKEN);

