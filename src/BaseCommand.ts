import { Message } from "discord.js";
import { getPrefix } from "./tools/load-environment";

interface BaseCommandOptions {
  isActive?: boolean;
  matchMode?: number;
  extenderSetsPrefix?: boolean; // Take commands raw, more customization
  name?: string;
}

export abstract class BaseCommandClass {
  name: string = this.constructor.name;
  commands: string[];       // Commands to use this action
  matchMode: number = 0;    // 0 => Exact match, 1 => options available
  isActive: boolean = true;

  constructor(commands: string[], options?: BaseCommandOptions) {
    // Add commands
    if (options?.extenderSetsPrefix) {
      this.commands = commands; // Prefix is set by extender
    } else { // Append prefix to all commands
      this.commands = commands.map(command => getPrefix() + command);
    }
    // Save optional arguments
    if (options) {
      const { isActive, name, matchMode } = options;
      if (name) this.name = name;
      if (isActive) this.isActive = isActive;
      if (matchMode) this.matchMode = matchMode;
    }
  }

  isThisCommand(message): boolean {
    if (!this.isActive) return false;
    // console.log('@isThisCommand:', this.name, this.commands, this.isActive, this.matchMode);
    if (this.matchMode === 0) {
      return this.commands.includes(message.content);
    } else if (this.matchMode === 1) {
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