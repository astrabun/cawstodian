import {REST, Routes} from 'discord.js';
import {env} from './env.js';
import {commands} from './commands/index.js';

const commandsData = Object.values(commands).map(command => (command as any).data); // eslint-disable-line @typescript-eslint/no-unsafe-return

const rest = new REST({version: '10'}).setToken(env.DISCORD_BOT_TOKEN);

type DeployCommandsProps = {
	guildId: string;
};

export async function deployCommands({guildId}: DeployCommandsProps) {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId),
			{
				body: commandsData,
			},
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

