import { Message } from "discord.js";
import { getPrefix } from "./tools/load-environment";
import { getGame } from './game/game';


interface BaseCommandOptions {
  isActive?: boolean;
  matchMode?: number; // MatchMode Enum
  extenderSetsPrefix?: boolean; // Take commands raw, more customization
  name?: string;
  requireActiveGame?: boolean;
}

export enum MatchMode {
  EXACT_MATCH = 0,
  STARTS_WITH // Autoincremented
}

export abstract class BaseCommandClass {
  name: string = this.constructor.name;
  commands: string[];       // Commands to use this action
  matchMode: number = MatchMode.EXACT_MATCH;
  isActive: boolean = true; // Active command
  requireActiveGame: boolean = false; // Boolean if command requires an active game to be valid

  constructor(commands: string[], options?: BaseCommandOptions) {
    // Add commands
    if (options?.extenderSetsPrefix) {
      this.commands = commands; // Prefix is set by extender
    } else { // Append prefix to all commands
      this.commands = commands.map(command => getPrefix() + command);
    }
    // Save optional arguments
    if (options) {
      const { isActive, name, matchMode, requireActiveGame } = options;
      if (name) this.name = name;
      if (isActive) this.isActive = isActive;
      if (matchMode) this.matchMode = matchMode;
      if (requireActiveGame) this.requireActiveGame = requireActiveGame;
    }
  }

  isThisCommand(message): boolean {
    if (!this.isActive) return false;
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

  abstract action(message: Message, options: string[]);
  abstract help(): string;
}

// Returns boolean of if message starts with string
// Can also accept command to be array, then if any command in array is start of msg, return true
export const startsWith = (message: Message, commands: string[] | string) => {
	//console.log('DEBUG @startsWith', command, Array.isArray(command));
	if (Array.isArray(commands)){
		for (let i = 0; i < commands.length; i++){
			if (message.content.lastIndexOf(commands[i], 0) === 0){
				return true;
			}
		}
		return false;
	} else {
		return (message.content.lastIndexOf(commands, 0) === 0);	
	}
}