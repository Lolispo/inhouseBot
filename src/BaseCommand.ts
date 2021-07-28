import { Message } from "discord.js";
import { getPrefix } from "./tools/load-environment";
import { getGame } from './game/game';
import { HelpMode, IMessageType, MatchMode } from "./BaseCommandTypes";


interface BaseCommandOptions {
  isActive?: boolean;
  matchMode?: MatchMode; // MatchMode Enum
  extenderSetsPrefix?: boolean; // Take commands raw, more customization
  name?: string;
  requireActiveGame?: boolean;
  includeHelpCommand?: boolean;
  allowedMessageTypes?: IMessageType[];
}

export abstract class BaseCommandClass {
  name: string = this.constructor.name;
  commands: string[];       // Commands to use this action
  matchMode: MatchMode = MatchMode.EXACT_MATCH;
  isActive: boolean = true; // Active command
  requireActiveGame: boolean = false; // Boolean if command requires an active game to be valid
  includeHelpCommand: boolean = true; // Include this command in help command
  allowedMessageTypes: IMessageType[] = [IMessageType.SERVER_MESSAGE];

  constructor(commands: string[], options?: BaseCommandOptions) {
    // Add commands
    if (options?.extenderSetsPrefix) {
      this.commands = commands; // Prefix is set by extender
    } else { // Append prefix to all commands
      this.commands = commands.map(command => getPrefix() + command);
    }
    // Save optional arguments
    if (options) {
      const { isActive, name, matchMode, requireActiveGame, includeHelpCommand, allowedMessageTypes } = options;
      if (name) this.name = name;
      if (isActive !== undefined) this.isActive = isActive;
      if (matchMode) this.matchMode = matchMode;
      if (requireActiveGame !== undefined) this.requireActiveGame = requireActiveGame;
      if (includeHelpCommand !== undefined) this.includeHelpCommand = includeHelpCommand;
      if (allowedMessageTypes) this.allowedMessageTypes = allowedMessageTypes;
    }
  }

  /**
   * Checks if the message sent matches this specific command
   * @param message the message
   * @param serverMessage boolean if its a server message vs 
   * @returns 
   */
  isThisCommand(message, messageType: IMessageType): boolean {
    if (!this.isActive) return false;
    if (!this.allowedMessageTypes.includes(messageType)) return false;
    if (this.requireActiveGame) {
      const gameObject = getGame(message.author);
      if (!gameObject) {
        // A game was required but no game was found
        return false;
      }
      gameObject.updateFreshMessage(message);
    }
    // console.log('@isThisCommand:', this.name, this.commands, this.isActive, this.matchMode);
    if (this.matchMode === MatchMode.EXACT_MATCH) {
      return this.commands.includes(message.content);
    } else if (this.matchMode === MatchMode.STARTS_WITH) {
      return startsWith(message, this.commands);
    } else {
      console.error('Invalid match mode provided!', this.name);
    }
  }

  /**
   * Action to do for the message
   * @param message Discord Message containing Author information and message content
   * @param options splitted parameters separated by space
   */
  abstract action(message: Message, options: string[]);

  /**
   * Returns the help message for this command
   * If a HelpMode is provided it will return that version if available
   * Defaults to normal if no other mode is implemented
   * @param mode 
   */
  abstract help(mode?: HelpMode): string;
}


// Returns boolean of if message starts with string
// Can also accept command to be array, then if any command in array is start of msg, return true
export const startsWith = (message: Message, commands: string[] | string) => {
	if (Array.isArray(commands)) {
		for (let i = 0; i < commands.length; i++) {
			if (message.content.lastIndexOf(commands[i], 0) === 0) {
				return true;
			}
		}
		return false;
	} else {
		return (message.content.lastIndexOf(commands, 0) === 0);	
	}
}