import 'dotenv/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  StringSelectMenuBuilder,
} from 'discord.js';
import { getOptions, getResult } from './game.js';
import { playInChannel, getRandomActiveVoiceChannel } from './player.js';
import { getHottestImage } from './reddit.js';
import { getRandomEmoji } from './utils.js';

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const activeGames = {};

const catChannelId = process.env.CAT_CHANNEL_ID ?? null;

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'cat') {
      await interaction.deferReply();
      try {
        const cat = await getHottestImage();

        if (!cat) {
          await interaction.editReply('No cats right now, try again later');
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle(cat.title)
          .setURL(cat.postUrl)
          .setImage(cat.imageUrl)
          .setColor(0x1E90FF) // Dodger blue
          .setFooter({ text: 'From r/cats 🐱' });
        await interaction.editReply({ embeds: [embed] });
      }
      catch (err) {
        console.error('Error fetching cat:', err);
      }
      return;
    }
    if (commandName === 'play') {
      const guild = interaction.guild;
      const member = await guild.members.fetch(interaction.user.id);
      const userVoiceChannel = member.voice.channel;
      const channel = userVoiceChannel ?? getRandomActiveVoiceChannel(guild);

      if (!channel) {
        await interaction.reply({
          content: 'No active voice channels!',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.reply({
        content: `Playing in ${channel.name}...`,
        flags: MessageFlags.Ephemeral,
      });
      await playInChannel(channel).catch(console.error);
      return;
    }
    if (commandName === 'rps') {
      const handName = interaction.options.getString('hand').toLowerCase();
      const challengeMessage = await interaction.reply({
        content: `Rock paper scissors from <@${interaction.user.id}>`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`accept_button_${interaction.id}`)
              .setLabel('Accept')
              .setStyle(ButtonStyle.Primary)
          ),
        ],
        withResponse: true,
      });
      activeGames[interaction.id] = {
        id: interaction.user.id,
        handName,
        messageId: challengeMessage.resource.message.id,
        channelId: interaction.channelId,
      };
      setTimeout(() => {
        if (activeGames[interaction.id]) {
          delete activeGames[interaction.id];
        }
      }, 24 * 60 * 60 * 1000);
      return;
    }
  }

  if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId.startsWith('accept_button_')) {
      const gameId = customId.replace('accept_button_', '');
      const game = activeGames[gameId];

      if (!game) {
        await interaction.reply({ content: 'This game has already ended.', flags: MessageFlags.Ephemeral });
        return;
      }
      await interaction.message.edit({
        content: interaction.message.content,
        components: [],
      });
      await interaction.reply({
        content: 'Rock, paper, or scissors?',
        flags: MessageFlags.Ephemeral,
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`select_choice_${gameId}`)
              .addOptions(getOptions())
          ),
        ],
      });
      return;
    }
  }

  if (interaction.isStringSelectMenu()) {
    const { customId } = interaction;

    if (customId.startsWith('select_choice_')) {
      const gameId = customId.replace('select_choice_', '');
      const game = activeGames[gameId];

      if (!game) return;

      const userId = interaction.user.id;
      const handName = interaction.values[0];
      const resultStr = getResult(game, { id: userId, handName });

      delete activeGames[gameId];

      await interaction.update({
        content: `Fair enough ${getRandomEmoji()}`,
        components: [],
      });
      const channel = await client.channels.fetch(game.channelId);
      const originalMessage = await channel.messages.fetch(game.messageId);

      await originalMessage.reply({ content: resultStr });
      return;
    }
  }
});

let bullyTarget = null;

const bullyMessages = process.env.BULLY_MESSAGES?.split('|') ?? ['...'];
const reactionSets = [
  ['🇧', '🇷', '🇺', '🇭'],
  ['🇨', '🇷', '🇮', '🇳', '🇬', '🇪'],
];

const eightBallResponses = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes, definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\'t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!')) {
    const args = message.content.slice(1).trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (cmd === '8ball') {
      const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
      await message.reply(`🎱 ${response}`);
      return;
    }
    if (cmd === 'bully') {
      const mentionedMember = message.mentions.members.first();
      const memberId = args[1];

      let target;

      if (mentionedMember) {
        target = mentionedMember;
      }
      else if (memberId) {
        try {
          target = await message.guild.members.fetch(memberId);
        }
        catch {
          await message.channel.send(`Who tf is ${memberId}`);
          return;
        }
      }
      else {
        await message.channel.send('Usage: `!bully @username or !bully <user ID>`');
        return;
      }
      bullyTarget = target;

      await message.channel.send(`${target.user.username} is cringe`);
      return;
    }
    if (cmd === 'target') {
      await message.channel.send(bullyTarget ? `${bullyTarget.user.username} is cringe` : 'Target not set');
      return;
    }
    if (cmd === 'stop') {
      const previousTarget = bullyTarget;

      bullyTarget = null;
      
      await message.channel.send(previousTarget ? `${previousTarget.user.username} is still cringe` : 'Target not set');
      return;
    }
    if (cmd === 'roll') {
      const input = args[1];
      const match = input?.match(/^(\d+)d(\d+)$/);

      if (!match) {
        await message.reply('Invalid format. Try something like `2d6` or `1d20`');
        return;
      }
      const numDice = Math.min(parseInt(match[1]), 100);
      const numSides = Math.min(parseInt(match[2]), 1000);
      const rolls = Array.from({ length: numDice }, () => Math.floor(Math.random() * numSides) + 1);
      const total = rolls.reduce((sum, r) => sum + r, 0);
      const rollStr = numDice > 1 ? ` (${rolls.join(' + ')})` : '';

      await message.reply(`🎲 ${input}: **${total}**${rollStr}`);
      return;
    }
    return;
  }
  const lower = message.content.toLowerCase();

  let start = Infinity;

  for (const [phrase, offset] of [["im ", 3], ["i'm ", 4], ["i am ", 5]]) {
    const idx = lower.indexOf(phrase);

    if (idx === 0) {
      start = offset;
      break;
    }
  }
  if (start !== Infinity) {
    const rest = message.content.slice(start).trim();

    if (rest.length > 0) await message.reply(`Hi ${rest}, I'm raspbot ${getRandomEmoji()}`);
  }
  if (!bullyTarget || message.author.id !== bullyTarget.id) return;

  const reactions = reactionSets[Math.floor(Math.random() * reactionSets.length)];

  for (const e of reactions) await message.react(e).catch(() => { });

  if (Math.random() < 0.05) {
    const bullyMessage = bullyMessages[Math.floor(Math.random() * bullyMessages.length)];
    await message.author.send(bullyMessage).catch(() => { });
  }
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function msUntilNext6PM() {
  const now = new Date();
  const pacific = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const next = new Date(pacific);
  next.setHours(14, 45, 0, 0);
  if (next <= pacific) next.setDate(next.getDate() + 1);
  return next - pacific;
}

async function postDailyCat() {
  if (!catChannelId) {
    console.warn('Cat channel ID not set');
    return;
  }
  try {
    const cat = await getHottestImage();
    if (!cat) { console.warn('No image found'); return; }
    const channel = await client.channels.fetch(catChannelId);
    const embed = new EmbedBuilder()
      .setTitle(cat.title)
      .setURL(cat.postUrl)
      .setImage(cat.imageUrl)
      .setColor(0x1E90FF) // Dodger blue
      .setFooter({ text: 'From r/cats 🐱' });
    await channel.send({ embeds: [embed] });
    console.log(`Posted: ${cat.title}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  setTimeout(() => {
    postDailyCat();
    setInterval(postDailyCat, MS_PER_DAY);
  }, msUntilNext6PM());
});

client.login(process.env.DISCORD_TOKEN);
