import { Message } from "discord.js";
import { getInhouseFighter } from "../../channels/channels";
import { getActiveGameModes, getModeChosen } from "../../game/gameModes";
import { deleteDiscMessage, print, shuffle } from '../../tools/f';


// @${getInhouseFighter()}
const startMessage = `Inhouse Temperature Check:\n`;
const endMessage = 'React on all timeslots which work for you and then we look for the most suitable time.\nIf you read this but can\'t play today, react with :x:';
const rowMessage = '\t- $$emoji$$ for $$game$$ Inhouse (Start $$start-time$$$$end-time$$)\n';
const withEnd = '-$$end-time$$';
const withNoEnd = ' +';

const globalEmojiList = [
  { icon: '🐒', title: 'monkey' },
  { icon: '🐯', title: 'tiger' },
  { icon: '🦓', title: 'zebra' },
  { icon: '🐪', title: 'dromedary_camel' },
  { icon: '🐇', title: 'rabbit2' },
  { icon: '🦁', title: 'lion' },
  { icon: '👌', title: 'ok_hand' },
  { icon: '👾', title: 'space_invader' },
  { icon: '🤖', title: 'robot' },
  { icon: '🎃', title: 'jack_o_lantern' },
  { icon: '😺', title: 'smiley_cat' },
  { icon: '🙀', title: 'heart_eyes_cat' },
];

const emoji_error = '❌';

let activeGlobalEmojiList;

const getOneRow = (game, time, emojiList, isLast = false): string => {
  console.log('@getOneRow: Start', rowMessage, emojiList, game, time);
  let s = rowMessage.replace(/\$\$emoji\$\$/g, `:${emojiList.title}:`);
  s = s.replace(/\$\$game\$\$/g, game);
  s = s.replace(/\$\$start-time\$\$/g, time);
  if (isLast) {
    s = s.replace(/\$\$end-time\$\$/g, withNoEnd);
  } else {
    s = s.replace(/\$\$end-time\$\$/g, withEnd.replace(/\$\$end-time\$\$/g, time + 1));
  }
  console.log('@getOneRow: End', s);
  return s;
}

const gameString = (game, startTime, index, hours): string => {
  const emojiList = globalEmojiList.slice(0 + (index * hours), hours + (index * hours)); // shuffle
  let s = '';
  for (let i = 0; i < hours; i++) {
    const isLast = i === (hours - 1);
    s += getOneRow(game, startTime + i, emojiList[i], isLast);
  }
  return s;
}

const generateGameTimeString = (gameOptions: string[], startTime, hours): string => {
  let s = startMessage;
  console.log('@generateGameTimeString', gameOptions, startTime, hours);
  gameOptions.forEach((gameName, index) => {
    s += gameString(gameName, startTime, index, hours);
  });
  s += endMessage;
  return s;
}

// Returns the time periods from the given options
export const getTimePeriods = (options: string[]) => {
  let startHour;
  let endHour;
  for (let i = 0; i < options.length; i++) {
    let option = options[i];
    let hours = [];
    try {
      if (Array.isArray(option)) continue;
      let num = parseInt(option);
      if (!startHour || num < startHour) startHour = num;
      if (!endHour || num > endHour) endHour = num;
      console.log('@Option', option, num, startHour, endHour);
      hours.push(num);
    } catch (e) {
      // Do nothing
      console.log('@Unable to parseInt', option);
    }
  }
  return {
    ...(startHour && { startHour }),
    ...(endHour && { endHour }),
  }
}

export const temperatureCheckCommand = (message: Message, options) => {
  const activeModes = getActiveGameModes();
  const gameName = getModeChosen(options, activeModes);
  let gameOptions = [];
  if (!gameName) {
    gameOptions = gameOptions.concat(activeModes);
  } else {
    gameOptions.push(gameName);
  }
  const { startHour, endHour } = getTimePeriods(options);
  console.log('@temperatureCheckCommand:', activeModes, gameName, gameOptions);

  // TODO: Allow inputting starttime and hours
  const startTime = startHour || 20;
  let hours = 3;
  if (endHour && startHour) {
    hours = endHour - startHour + 1;
  }
  console.log('@temperatureCheck Times:', startTime, hours, startHour, endHour);

  // Set global emoji reactions
  const emojiAmount = hours * gameOptions.length
  if (emojiAmount > globalEmojiList.length) {
    print(message, '(Not enough emojis to support this amount)');
  } else {
    activeGlobalEmojiList = globalEmojiList.slice(0, emojiAmount);
    const temperatureMessage = generateGameTimeString(gameOptions, startTime, hours);
    print(message, temperatureMessage, callbackMessageTemperature);
    // TODO: Store reference to temperatureMessage
  }  
}

const callbackMessageTemperature = (message) => {
  // Add reactions
  message.react(emoji_error);
  activeGlobalEmojiList.forEach(emoji => {
    message.react(emoji.icon);
  })
  deleteDiscMessage(message, 24 * 3600 * 1000, 'messageTemperature');
}