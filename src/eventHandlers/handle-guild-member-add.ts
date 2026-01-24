import {type GuildMember} from 'discord.js';

const generateMathChallenge = (): {question: string; answer: number} => {
	const a = Math.floor(Math.random() * 12) + 1;
	const b = Math.floor(Math.random() * 12) + 1;
	const ops = ['+'] as const;
	const op = ops[Math.floor(Math.random() * ops.length)];
	const question = `${a} ${op} ${b}`;
	const answer = a + b;
	// If other ops added in the future:
	// let answer: number;
	// switch (op) { // eslint-disable-line @typescript-eslint/switch-exhaustiveness-check
	// 	case '+': {
	// 		answer = a + b;
	// 		break;
	// 	}

	// 	default: {
	// 		answer = a + b;
	// 		break;
	// 	}
	// }

	return {question, answer};
};

const handleGuildMemberAdd = async (member: GuildMember) => {
	console.log(`[JOIN]: ${member.toString()}`);

	const {question, answer} = generateMathChallenge();
	let channel: any;

	try {
		channel = await member.createDM();
		await channel.send( // eslint-disable-line @typescript-eslint/no-unsafe-call, @stylistic/function-paren-newline
			`Hello ${member.displayName}! Thanks for joining ${member.guild.name}.
To verify your membership, please answer the following math problem within 5 minutes:
${question}`);
	} catch {
		const {systemChannel} = member.guild;
		if (systemChannel) {
			channel = systemChannel;
			await systemChannel.send(`<@${member.id}>, I couldn't DM you. Please answer the following math problem within 5 minutes to avoid removal:
${question}`);
		} else {
			try {
				await member.kick('Failed verification: unable to DM member');
			} catch {}

			return;
		}
	}

	const filter = (m: {author: {id: string}}) => m.author.id === member.id;
	// Give members 5 minutes to answer (message told them 5 minutes).
	const collector = channel.createMessageCollector({filter, time: 5 * 60 * 1000, max: 1}); // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call

	let handled = false;
	collector.on('collect', async (m: any) => { // eslint-disable-line @typescript-eslint/no-unsafe-call
		const content = String(m.content ?? '').trim();
		const parsed = Number(content);

		// Mark handled and stop collector synchronously to avoid the collector
		// emitting 'end' before this async handler finishes (race condition).
		handled = true;
		collector.stop(); // eslint-disable-line @typescript-eslint/no-unsafe-call

		if (!Number.isNaN(parsed) && parsed === answer) {
			try {
				await channel.send('✅ Verification passed — welcome!'); // eslint-disable-line @typescript-eslint/no-unsafe-call
				console.log(`[VERIFIED]: ${member.toString()}`);
			} catch {}
		} else {
			try {
				await channel.send('❌ Incorrect answer. You will be removed from the server.'); // eslint-disable-line @typescript-eslint/no-unsafe-call
				console.log(`[INCORRECT]: ${member.toString()}`);
			} catch {}

			try {
				await member.kick('Failed verification: incorrect answer');
				console.log(`[INCORRECT]: ${member.toString()}`);
			} catch {}
		}
	});

	collector.on('end', async () => { // eslint-disable-line @typescript-eslint/no-unsafe-call
		if (!handled) {
			try {
				await channel.send('⏰ Verification timed out — removing member.'); // eslint-disable-line @typescript-eslint/no-unsafe-call
				console.log(`[TIMEOUT]: ${member.toString()}`);
			} catch {}

			try {
				await member.kick('Failed verification: timeout');
				console.log(`[TIMEOUT]: ${member.toString()}`);
			} catch {}
		}
	});
};

export default handleGuildMemberAdd;
