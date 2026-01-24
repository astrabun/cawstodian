/* eslint-disable n/prefer-global/process */
/* eslint-disable @typescript-eslint/naming-convention */
import {config as dotenvxConfig} from '@dotenvx/dotenvx';

dotenvxConfig();

const {DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN} = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
	throw new Error('Missing environment variables');
}

export const env = {
	DISCORD_CLIENT_ID,
	DISCORD_BOT_TOKEN,
};
