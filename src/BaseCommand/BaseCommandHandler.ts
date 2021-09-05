import { Message } from "discord.js";
import { CommandTypes } from "./BaseCommand";
import { IMessageType } from "./BaseCommandTypes";
import { getGame } from "../game/game";
import { allAvailableCommands } from "./mainCommand";
import { callbackInvalidCommand, deleteDiscMessage, print } from "../tools/f";

/**
 * Handles which message is the valid one
 * @param message incoming message
 * @param options given options
 * @param context provided context, default SERVER (DM different)
 * @returns boolean, true if it has found a command, otherwise false
 */
 export const handleMessageBaseCommand = (message: Message, options: string[], context: IMessageType = IMessageType.SERVER_MESSAGE): boolean => {
  const loadedCommands = allAvailableCommands();
  // console.log('@handleMessageBaseCmmand', message.content, context);
  for (let i = 0; i < loadedCommands.length; i++) {
    const command = loadedCommands[i];
    const commandEvaluation = command.isThisCommand(message, context);
    if (commandEvaluation === CommandTypes.VALID_COMMAND) {
      // isThisCommand makes sure all games that require a game has a game
      // console.log('@LoadedCommand:', command.name, commandEvaluation);
      const shouldDeleteActionMessage: boolean | undefined = command.action(
        message,
        options,
        {
          ...(command.requireActiveGame && { gameObject: getGame(message.author) })
        }
      );
      if (shouldDeleteActionMessage) deleteDiscMessage(message, 30000, command.name);
      return false; // Don't do another command since an action was done already
    } else if (commandEvaluation === CommandTypes.NON_MATCHING_COMMAND || commandEvaluation === CommandTypes.INACTIVE_COMMAND) {
      continue; // It is not this command
    } else { // It is matching this command but wasn't valid
      if (commandEvaluation === CommandTypes.ADMIN_COMMAND) {
        print(message, `Invalid command ${command.name}: You need to be an admin to use this command`, callbackInvalidCommand);
      } else if (commandEvaluation === CommandTypes.REQUIRES_GAME) {
        print(message, `Invalid command ${command.name}: User ${message.author.username} not currently in a game`, callbackInvalidCommand);
      } else {
        print(message, `Invalid command ${command.name}: Reason: ${commandEvaluation}`, callbackInvalidCommand);
      }
      return false; // Don't do another command since it matched this one
    }
  }
  return true;
}