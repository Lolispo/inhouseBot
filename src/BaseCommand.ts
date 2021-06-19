import { Message } from "discord.js";
import { getPrefix } from "./tools/load-environment";

interface BaseCommandOptions {
  extenderSetsPrefix?: boolean;
  name: string;
}

export abstract class BaseCommandClass {
  name: string;
  commands: string[];

  constructor(commands, public isActive: boolean = true, public matchMode: number = 0, options?: BaseCommandOptions) {
    if (options?.extenderSetsPrefix) {
      // Take commands raw, more customization
      this.commands = commands;
    } else {
      // console.log('debug', getPrefix(), commands);
      this.commands = commands.map(command => getPrefix() + command);
    }
    if (options?.name) {
      this.name = options.name;
    } else {
      this.name = this.constructor.name;
    }
  }

  isThisCommand(message): boolean {
    if (!this.isActive) return false;
    // console.log('@isThisCommand:', this.name, this.commands, this.isActive, this.matchMode);
    if (this.matchMode === 0) {
      return this.commands.includes(message.content);
    } else if (this.matchMode === 1) {
      startsWith(message, this.commands)
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