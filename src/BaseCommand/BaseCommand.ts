import { Message } from "discord.js";
import { getPrefix } from "../tools/load-environment";
import { Game, getGame } from '../game/game';
import { getAdminUids, HelpMode, IMessageType, MatchMode } from "./BaseCommandTypes";


interface BaseCommandOptions {
  isActive?: boolean;
  matchMode?: MatchMode; // MatchMode Enum
  extenderSetsPrefix?: boolean; // Take commands raw, more customization
  name?: string;
  requireActiveGame?: boolean;
  includeHelpCommand?: boolean;
  allowedMessageTypes?: IMessageType[];
  adminCommand?: boolean;
}

export interface AdditionalParams {
  gameObject?: Game
}

export enum CommandTypes {
  'VALID_COMMAND',
  'INVALID_COMMAND',
  'NON_MATCHING_COMMAND',
  'ADMIN_COMMAND',
  'INACTIVE_COMMAND',
  'WRONG_CONTEXT_COMMAND',
  'REQUIRES_GAME',
}

export abstract class BaseCommandClass {
  name: string = this.constructor.name;
  commands: string[];       // Commands to use this action
  matchMode: MatchMode = MatchMode.EXACT_MATCH;
  isActive: boolean = true; // Active command
  requireActiveGame: boolean = false; // Boolean if command requires an active game to be valid
  includeHelpCommand: boolean = true; // Include this command in help command
  allowedMessageTypes: IMessageType[] = [IMessageType.SERVER_MESSAGE]; // Allowed message types for this command
  adminCommand: boolean = false; // Only admins are allowed to use this command

  constructor(commands: string[], options?: BaseCommandOptions) {
    // Add commands
    if (options?.extenderSetsPrefix) {
      this.commands = commands; // Prefix is set by extender
    } else { // Append prefix to all commands
      this.commands = commands.map(command => getPrefix() + command);
    }
    // Save optional arguments
    if (options) {
      const { isActive, name, matchMode, requireActiveGame, includeHelpCommand, allowedMessageTypes, adminCommand } = options;
      if (name) this.name = name;
      if (isActive !== undefined) this.isActive = isActive;
      if (matchMode) this.matchMode = matchMode;
      if (requireActiveGame !== undefined) this.requireActiveGame = requireActiveGame;
      if (includeHelpCommand !== undefined) this.includeHelpCommand = includeHelpCommand;
      if (allowedMessageTypes) this.allowedMessageTypes = allowedMessageTypes;
      if (adminCommand !== undefined) this.adminCommand = adminCommand;
    }
  }

  /**
   * Check if the message matches towards this command based on the matchmode
   * @param message incoming message
   * @returns boolean if the entered command is meant to be this command or not
   */
  evaluateThisCommand(message: Message): boolean {
    if (this.matchMode === MatchMode.EXACT_MATCH) {
      // console.log(this.commands.includes(message.content));
      return this.commands.includes(message.content);
    } else if (this.matchMode === MatchMode.STARTS_WITH) {
      // console.log(startsWith(message, this.commands));
      return startsWith(message, this.commands);
    } else {
      console.error('Invalid match mode provided!', this.name);
      return false;
    }
  }

  /**
   * Checks if the message sent matches this specific command
   * @param message the message
   * @param serverMessage boolean if its a server message vs 
   * @returns 
   */
  isThisCommand(message: Message, messageType: IMessageType): CommandTypes {
    // console.log('@isThisCommand', this.name, this.matchMode, this.isActive, this.allowedMessageTypes.includes(messageType), this.commands)
    if (!this.isActive) return CommandTypes.INACTIVE_COMMAND;                                                // Sort out inactive 
    if (!this.evaluateThisCommand(message)) return CommandTypes.NON_MATCHING_COMMAND;                        // Checks if it matches towards this command
    if (!this.allowedMessageTypes.includes(messageType)) return CommandTypes.WRONG_CONTEXT_COMMAND;          // Checks DM / Server message
    if (this.adminCommand && !getAdminUids().includes(message.author.id)) return CommandTypes.ADMIN_COMMAND; // Admin command
    if (this.requireActiveGame) {
      const gameObject = getGame(message.author);
      if (!gameObject) {
        // A game was required but no game was found
        return CommandTypes.REQUIRES_GAME;
      }
      gameObject.updateFreshMessage(message);
    }
    // console.log('@isThisCommand:', this.name, this.commands, this.isActive, this.matchMode);
    // Return valid command since evalutedThisCommand is true
    return CommandTypes.VALID_COMMAND;
  }

  /**
   * Action to do for the message
   * @param message Discord Message containing Author information and message content
   * @param options splitted parameters separated by space
   * @param gameObject Connected gameobject if command requires an active game
   * @return Return can be used to evaluate if default deletion on action message should be used (Default 30 sec on true)
   */
  abstract action(message: Message, options: string[], additionalParams?: AdditionalParams);

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