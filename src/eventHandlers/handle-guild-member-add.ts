import {type DMChannel, type GuildMember, type Attachment} from 'discord.js';

const numbersToAdd = [
	'num_1.png',
	'num_2.png',
	'num_3.png',
	'num_4.png',
	'num_5.png',
	'num_6.png',
	'num_7.png',
	'num_8.png',
	'num_9.png',
	'num_10.png',
	'num_11.png',
	'num_12.png',
].map(i => `./src/assets/numbers/${i}`);

const generateMathChallenge = (): {question: string; answer: number; a: number; b: number} => {
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

	return {
		question, answer, a, b,
	};
};

const handleGuildMemberAdd = async (member: GuildMember) => {
	console.log(`[JOIN]: ${member.toString()}`);

	const {question, answer, a, b} = generateMathChallenge();
	let channel: any;

	try {
		channel = await member.createDM();
		/* Original question format:
		await channel.send( // eslint-disable-line @typescript-eslint/no-unsafe-call, @stylistic/function-paren-newline
			`Hello ${member.displayName}! Thanks for joining ${member.guild.name}.
To verify your membership, please answer the following math problem within 5 minutes:
${question}`); */
		await (channel as DMChannel).send({
			content: `Hello ${member.displayName}! Thanks for joining ${member.guild.name}.
To verify your membership, please answer a math problem within 5 minutes. What is the sum (addition) of the two numbers contained in the images?`,
			files: [
				{attachment: numbersToAdd[a - 1]!, name: 'first_number.png'},
				{attachment: numbersToAdd[b - 1]!, name: 'second_number.png'},
			],
		});
	} catch (error) {
		console.error(error);
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
