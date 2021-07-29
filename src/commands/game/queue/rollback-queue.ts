import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { print, deleteDiscMessage } from "../../../tools/f";
import { ActionType, QueueAction } from "./queue";

const commands = ['rollbackqueue', 'revert', 'rbq'];

export class RollbackQueue extends BaseCommandClass {
  static instance: RollbackQueue = new RollbackQueue(commands);

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    const result = QueueAction.instance.rollbackQueueAction();
    const printString = ActionType[result.type] + ': ' + result.users + (result.index !== undefined ? ' (Pos: ' + result.index + ')' : '');
    print(message, 'Rolled back action: ' + printString);
    deleteDiscMessage(message, 15000, 'curretqueue');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Rollsback latest queue action';
  }
}