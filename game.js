import { capitalize } from './utils.js';

export function getResult(p1, p2) {
  let gameResult;
  if (RPSChoices[p1.handName] && RPSChoices[p1.handName][p2.handName]) {
    gameResult = {
      win: p1,
      lose: p2,
      verb: RPSChoices[p1.handName][p2.handName],
    };
  } else if (RPSChoices[p2.handName] && RPSChoices[p2.handName][p1.handName]) {
    gameResult = {
      win: p2,
      lose: p1,
      verb: RPSChoices[p2.handName][p1.handName],
    };
  } else {
    gameResult = { win: p1, lose: p2, verb: 'tie' };
  }
  return formatResult(gameResult);
}

function formatResult(result) {
  const { win, lose, verb } = result;
  return verb === 'tie'
    ? `<@${win.id}> and <@${lose.id}> both chose **${win.handName}**`
    : `<@${win.id}>'s **${win.handName}** ${verb} <@${lose.id}>'s **${lose.handName}**`;
}

const RPSChoices = {
  rock: { scissors: 'crushes' },
  paper: { rock: 'covers' },
  scissors: { paper: 'cuts' },
};

export function getRPSChoices() {
  return Object.keys(RPSChoices);
}

export function getOptions() {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
    });
  }
  return options;
}
