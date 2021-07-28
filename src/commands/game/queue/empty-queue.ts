import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
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
    const updatedQueue = instance.emptyQueue();
    print(message, `Queue Emptied! You can now queue again\n`);
    deleteDiscMessage(message, 15000, 'emptyqueue');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Empty queue';
  }
}