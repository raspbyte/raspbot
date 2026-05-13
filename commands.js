import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }
  return commandChoices;
}

const CAT_COMMAND = {
  name: 'cat',
  description: 'Post the hottest cat from r/cats right now',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const PLAY_COMMAND = {
  name: 'play',
  description: 'Play a sound in an active voice channel',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const RPS_COMMAND = {
  name: 'rps',
  description: 'Start a game of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'hand',
      description: 'Rock, paper, or scissors?',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [CAT_COMMAND, PLAY_COMMAND, RPS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
