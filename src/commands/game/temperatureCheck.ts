import { Message } from "discord.js";
import { getActiveGameModes, getModeChosen } from "../../game/gameModes";
import { print } from '../../tools/f';



const startMessage = 'Inhouse temperature Check:\n';
const endMessage = 'React on all timeslots which work for you and then we look for the most suitable time';
const rowMessage = '\t- $$emoji$$ for $$game$$ Inhouse (Start $$start-time$$$$end-time$$)';
const withEnd = '-$$end-time$$';
const withNoEnd = ' +';

const globalEmojiList = [
  ':Mirage:',
  ':Overpass:',
  ':Dust2:',
  ':PetterHands:',
  ':monkaS:',
  ':PeppeMods:',
  ':Pog:',
  ':Poggers:',
  ':tada:',
  ':sadpog:',
  ':luldab2:',
  ':PepeMods:',
  ':RobinEgh:'
];

const getOneRow = (game, time, emojiList): string => {
  let s = rowMessage.replace('/\$\$emoji\$\$/g', emojiList[0]);
  s = s.replace('/\$\$game\$\$/g', game);
  s = s.replace('/\$\$start-time\$\$/g', time);
  return s;
}

const gameString = (game, startTime, index, hours): string => {
  const emojiList = globalEmojiList.slice(0 + (index * hours), hours + (index * hours))
  let s = '';
  for (let i = 0; i < hours; i++) {
    s += getOneRow(game, startTime + i, emojiList[i]);
  }
  return s;
}

const generateGameTimeString = (gameOptions: string[], startTime = 20, hours = 3): string => {
  let s = startMessage;
  gameOptions.forEach((gameName, index) => {
    s += gameString(gameName, startTime, index, hours);
  });
  s += endMessage;
  return s;
}

export const temperatureCheckCommand = (message: Message, options) => {
  const activeModes = getActiveGameModes();
  const game = getModeChosen(options, activeModes);
  let gameOptions = [];
  if (!game) {
    gameOptions.concat(activeModes);
  } else {
    gameOptions.push(game);
  }

  // TODO: Allow inputting starttime and hours

  const temperatureMessage = generateGameTimeString(gameOptions);
  print(message, temperatureMessage);
}