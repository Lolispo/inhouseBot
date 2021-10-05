import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { MatchMode } from "../../BaseCommand/BaseCommandTypes";
import { GameModesType, getActiveGameModes, getModeChosen } from "../../game/gameModes";
import { callbackInvalidCommand, callbackModified, deleteDiscMessage, editMessage, print } from '../../tools/f';


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
  { icon: '🤖', title: 'robot' },
  { icon: '🎃', title: 'jack_o_lantern' },
  { icon: '😺', title: 'smiley_cat' },
  { icon: '😻', title: 'heart_eyes_cat' },
  { icon: '🙀', title: 'scream_cat' },
  { icon: '🦆', title: 'duck' },
  { icon: '🐷', title: 'pig' },
  { icon: '🐶', title: 'dog' }
];

const emoji_error = '❌';

interface Emoji {
  icon: string;
  title: string;
}

interface DailyMessage {
  message: Message;
  date: Date,
  messages: DiscordMessage[],
}

interface GameOptions {
  gameOptions: string[];
  startTime: number;
  hours: number;
}

interface OptionsFields {
  gameOptions: GameOptions;
  emojiCount: number
}

interface DiscordMessage {
  game: string;
  time: number;
  message: string;
  emoji: Emoji;
}

export class TemperatureCheckAction extends BaseCommandClass {
  static instance: TemperatureCheckAction = new TemperatureCheckAction(commands, { matchMode: MatchMode.STARTS_WITH });
  static discordMessages;
  static dailyMessage: DailyMessage;
  static emojiIndex: number = 0;

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
  
  // Get all strings for a game
  gameString = (game, startTime, index, hours): DiscordMessage[] => {
    // const emojiList = globalEmojiList.slice(0 + (index * hours), hours + (index * hours));
    let messages: DiscordMessage[] = [];
    for (let i = 0; i < hours; i++) {
      const isLast = i === (hours - 1);
      const emoji = globalEmojiList[TemperatureCheckAction.emojiIndex++];
      messages.push({
        game,
        time: startTime + i,
        message: this.getOneRow(game, startTime + i, emoji, isLast),
        emoji: emoji,
      });
    }
    return messages;
  }

  generateGameTimeString = (discordMessages: DiscordMessage[]): string => {
    let s = startMessage;
    discordMessages.forEach(message => {
      s += message.message;
    })
    s += endMessage;
    return s;
  }

  /**
   * Only add objects that have new values
   * Uniqueness: game + time
   */
  addUniqueNewElements = (previousArray: DiscordMessage[], newArray: DiscordMessage[]): DiscordMessage[] => {
    newArray.forEach((el: DiscordMessage) => {
      const foundEl = previousArray.find((element: DiscordMessage) => {
        return el.game === element.game && el.time === element.time;
      });
      if (foundEl) {
        // Allow emoji to be reused

        return;
      } 
      previousArray.push(el); // Add new time to new array
    });
    return previousArray;
  }
  
  buildDiscordMessages = (gameOptionsParam: GameOptions, previousDiscordMessages: DiscordMessage[] = []): DiscordMessage[] => {
    const { gameOptions, startTime, hours } = gameOptionsParam;
    let messagesArray: DiscordMessage[] = previousDiscordMessages;
    console.log('@generateGameTimeString', gameOptions, startTime, hours);
    gameOptions.forEach((gameName, index) => {
      messagesArray = this.addUniqueNewElements(messagesArray, this.gameString(gameName, startTime, index, hours));
    });
    // Sort on game ASC and then time ASC
    messagesArray = messagesArray.sort((a: DiscordMessage, b: DiscordMessage) => {
      if (a.game.localeCompare(b.game) === 0) {
        return a.time - b.time;
      }
      return a.game.localeCompare(b.game);
    });
    return messagesArray;
  }
  
  // Returns the time periods from the given options
  getTimePeriods = (options: string[]) => {
    let startHour;
    let endHour;
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      let hours: number[] = [];
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
    TemperatureCheckAction.dailyMessage = {
      message,
      date: new Date(),
      messages: TemperatureCheckAction.discordMessages
    }
    message.react(emoji_error); // TODO: Only do this if not already reacted with this emoji
    /*
    const activeGlobalEmojiList = globalEmojiList.slice(0, TemperatureCheckAction.emojiCount);
    activeGlobalEmojiList.forEach(emoji => {
      message.react(emoji.icon);
    })
    */
    TemperatureCheckAction.discordMessages.forEach((discordMessage: DiscordMessage) => {
      const emoji = discordMessage.emoji;
      message.react(emoji.icon);
    })
    deleteDiscMessage(message, 24 * 3600 * 1000, 'messageTemperature');
  }

  messageInCurrentDay(daily: DailyMessage): boolean {
    const date = daily.date.getDate();
    const currentDate = new Date().getDate();
    return date === currentDate;
  }

  loadOptions(options: string[]): OptionsFields {
    const activeModes = getActiveGameModes();
    // activeModes.splice(activeModes.indexOf(GameModesStandard.CS), 1); // CS Temporaryily disabled from default temperature checks
    const gameName = getModeChosen(options, activeModes);
    let gameOptions: GameModesType[] = [];
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
    const emojiCount = hours * gameOptions.length;
    // console.log('@temperatureCheck Times:', startTime, hours, startHour, endHour);
    return {
      gameOptions: {
        gameOptions,
        startTime,
        hours
      },
      emojiCount
    }
  }

  action = async (message: Message, options: string[]) => {
    if (TemperatureCheckAction.dailyMessage) {
      // A daily message exist
      if (this.messageInCurrentDay(TemperatureCheckAction.dailyMessage)) {
        // Patch message
        const { gameOptions, emojiCount } = this.loadOptions(options);
        const daily = TemperatureCheckAction.dailyMessage;
        const currentDailyMessage = daily.message;

        // Send in current discord messages to not rebuild from scratch and only take new ones
        if (TemperatureCheckAction.emojiIndex + emojiCount > globalEmojiList.length) {
          print(message, '(Not enough emojis to support this amount)', callbackInvalidCommand);
        } else {
          const builtMessages = this.buildDiscordMessages(gameOptions, daily.messages); 
          TemperatureCheckAction.discordMessages = builtMessages;
          const temperatureMessage = this.generateGameTimeString(builtMessages);
          editMessage(currentDailyMessage, temperatureMessage, this.callbackMessageTemperature);
          // if (emojiCount > daily.emojiCount)
          print(message, 'Edited the existing daily temperature message', callbackModified);
        }
        return;
      } else { // Daily message is for a previous day, clean this message
        const prevDailyMessage = TemperatureCheckAction.dailyMessage.message;
        // TODO: Delete previous daily message
        console.log('DEBUG DELETE OLDER DAILY:', prevDailyMessage.content);
        TemperatureCheckAction.emojiIndex = 0; // Reset index for emojis
      }
    }
    const { gameOptions, emojiCount } = this.loadOptions(options);  
    // Set global emoji reactions
    if (TemperatureCheckAction.emojiIndex + emojiCount > globalEmojiList.length) {
      print(message, '(Not enough emojis to support this amount)', callbackInvalidCommand);
    } else {
      const builtMessages = this.buildDiscordMessages(gameOptions); 
      TemperatureCheckAction.discordMessages = builtMessages;
      const temperatureMessage = this.generateGameTimeString(builtMessages);
      print(message, temperatureMessage, this.callbackMessageTemperature);
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' [gameName] [startHour] [endHour]** Temperature Check for the day. Defaults to game dota and hours between 20 and 22';
  }
}

