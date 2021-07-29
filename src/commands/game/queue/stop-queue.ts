import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { IMessageType } from "../../../BaseCommandTypes";
import { print, deleteDiscMessage } from "../../../tools/f";
import { QueueAction } from "./queue";

const commands = ['stopqueue', 'leavequeue', 'sq'];

export class StopQueueAction extends BaseCommandClass {
  static instance: StopQueueAction = new StopQueueAction(commands, { allowedMessageTypes: [IMessageType.DIRECT_MESSAGE, IMessageType.SERVER_MESSAGE] });

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    const author = message.author;
    const instance = QueueAction.instance;
    const removedUsers = instance.removePlayer(author);
    const queueMessage = removedUsers?.length > 0 ? `**${author.username}** stopped queueing.\n${QueueAction.queueToString()}` : `Queue unchanged (User wasn't queueing)`;
    print(message, queueMessage, (messageVar) => {
      deleteDiscMessage(messageVar, 15000, 'stopqueueprint')
    });
    deleteDiscMessage(message, 15000, 'stopqueue');
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Stop queueing and remove yourself from the queue';
  }
}