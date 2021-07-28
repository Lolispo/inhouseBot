import { Message } from "discord.js";
import { BaseCommandClass, MatchMode } from "../../BaseCommand";
import { getActiveGameModes, getModeChosen } from "../../game/gameModes";
import { deleteDiscMessage, print } from '../../tools/f';


const commands = ['temperature', 'daily', 'temperaturecheck', 'temp']

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
export class TemperatureCheckAction extends BaseCommandClass {
  static instance: TemperatureCheckAction = new TemperatureCheckAction(commands, { matchMode: MatchMode.STARTS_WITH });
  static activeGlobalEmojiList;

  getOneRow = (game, time, emojiList, isLast = false): string => {
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
  
  gameString = (game, startTime, index, hours): string => {
    const emojiList = globalEmojiList.slice(0 + (index * hours), hours + (index * hours)); // shuffle
    let s = '';
    for (let i = 0; i < hours; i++) {
      const isLast = i === (hours - 1);
      s += this.getOneRow(game, startTime + i, emojiList[i], isLast);
    }
    return s;
  }
  
  generateGameTimeString = (gameOptions: string[], startTime, hours): string => {
    let s = startMessage;
    console.log('@generateGameTimeString', gameOptions, startTime, hours);
    gameOptions.forEach((gameName, index) => {
      s += this.gameString(gameName, startTime, index, hours);
    });
    s += endMessage;
    return s;
  }
  
  // Returns the time periods from the given options
  getTimePeriods = (options: string[]) => {
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
  
  callbackMessageTemperature = (message) => {
    // Add reactions
    message.react(emoji_error);
    TemperatureCheckAction.activeGlobalEmojiList.forEach(emoji => {
      message.react(emoji.icon);
    })
    deleteDiscMessage(message, 24 * 3600 * 1000, 'messageTemperature');
  }

  action = async (message: Message, options: string[]) => {
    const activeModes = getActiveGameModes();
    const gameName = getModeChosen(options, activeModes);
    let gameOptions = [];
    if (!gameName) {
      gameOptions = gameOptions.concat(activeModes);
    } else {
      gameOptions.push(gameName);
    }
    const { startHour, endHour } = this.getTimePeriods(options);
    // console.log('@temperatureCheckCommand:', activeModes, gameName, gameOptions);

    // TODO: Allow inputting starttime and hours
    const startTime = startHour || 20;
    let hours = 3;
    if (endHour && startHour) {
      hours = endHour - startHour + 1;
    }
    // console.log('@temperatureCheck Times:', startTime, hours, startHour, endHour);

    // Set global emoji reactions
    const emojiAmount = hours * gameOptions.length
    if (emojiAmount > globalEmojiList.length) {
      print(message, '(Not enough emojis to support this amount)');
    } else {
      TemperatureCheckAction.activeGlobalEmojiList = globalEmojiList.slice(0, emojiAmount);
      const temperatureMessage = this.generateGameTimeString(gameOptions, startTime, hours);
      print(message, temperatureMessage, this.callbackMessageTemperature);
      // TODO: Store reference to temperatureMessage
    }  
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' [gameName] [startHour] [endHour]** Temperature Check for the day. Defaults to game dota and hours between 20 and 22';
  }
}

