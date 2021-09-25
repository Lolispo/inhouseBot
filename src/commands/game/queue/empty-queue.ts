import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand/BaseCommand";
import { print, deleteDiscMessage } from "../../../tools/f";
import { QueueAction } from "./queue";

const commands = ['emptyqueue'];

export class EmptyQueueAction extends BaseCommandClass {
  static instance: EmptyQueueAction = new EmptyQueueAction(commands, { adminCommand: true });

  /**
   * Empty queue of all players
   */
  action = (message: Message, options: string[]) => {
    const instance = QueueAction.instance;
    const previousQueue = instance.emptyQueue();
    print(message, previousQueue.length > 0 ? `Queue Emptied! ${previousQueue.length} users removed!` : `Queue was already empty`, (messageVar) => {
      deleteDiscMessage(messageVar, 15000, 'emptyqueueprint')
    });
    deleteDiscMessage(message, 15000, 'emptyqueue');
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Empty queue';
  }
}