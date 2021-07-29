import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { print, deleteDiscMessage } from "../../../tools/f";
import { QueueAction } from "./queue";

const commands = ['currentqueue', 'showqueue'];

export class CurrentQueueAction extends BaseCommandClass {
  static instance: CurrentQueueAction = new CurrentQueueAction(commands);

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    print(message, `${QueueAction.queueToString()}`, (messageVar) => {
      deleteDiscMessage(messageVar, 60000, 'currentqueueprint')
    });
    deleteDiscMessage(message, 15000, 'currentqueue');
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Show current queue';
  }
}