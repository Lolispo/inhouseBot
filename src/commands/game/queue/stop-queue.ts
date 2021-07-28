import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { print, deleteDiscMessage } from "../../../tools/f";
import { QueueAction } from "./queue";

const commands = ['stopqueue', 'leavequeue'];

export class StopQueueAction extends BaseCommandClass {
  static instance: StopQueueAction = new StopQueueAction(commands);

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    const author = message.author;
    const instance = QueueAction.instance;
    const removedUsers = instance.removePlayerById(author.id);
    const queueMessage = removedUsers.length > 0 ? `**${author.username}** stopped queueing.\n${QueueAction.queueToString()}` : `Queue unchanged (User wasn't queueing)`;
    print(message, queueMessage);
    deleteDiscMessage(message, 15000, 'stopqueue');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Stop queueing and remove yourself from the queue';
  }
}