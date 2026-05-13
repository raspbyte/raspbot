import 'dotenv/config';
import { REST, Routes } from 'discord.js';

export async function InstallGlobalCommands(appId, commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const data = await rest.put(Routes.applicationCommands(appId), { body: commands });
    console.log('Discord response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
