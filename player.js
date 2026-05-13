import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const SOUNDS_DIR = './sounds';

function getRandomSound() {
  const files = fs.readdirSync(SOUNDS_DIR).filter(f => f.endsWith('.mp3'));
  if (files.length === 0) return null;
  return path.join(SOUNDS_DIR, files[Math.floor(Math.random() * files.length)]);
}

export function getRandomActiveVoiceChannel(guild) {
  const voiceChannels = guild.channels.cache.filter(c =>
    c.isVoiceBased() &&
    c.members.filter(m => !m.user.bot).size > 0
  );
  if (voiceChannels.size === 0) return null;
  const arr = [...voiceChannels.values()];
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function playInChannel(channel) {
  const soundPath = getRandomSound();
  if (!soundPath) {
    console.warn('No .mp3 files found in /sounds');
    return;
  }

  const freshChannel = await channel.guild.channels.fetch(channel.id);

  const connection = joinVoiceChannel({
    channelId: freshChannel.id,
    guildId: freshChannel.guild.id,
    adapterCreator: freshChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  connection.on('error', (err) => {
    console.error('Connection error:', err);
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 12_000);

    const player = createAudioPlayer();
    const resource = createAudioResource(soundPath);

    connection.subscribe(player);
    player.play(resource);

    await entersState(player, AudioPlayerStatus.Idle, 60_000);
  } catch (err) {
    console.error('Error playing audio:', err);
  } finally {
    connection.destroy();
  }
}
