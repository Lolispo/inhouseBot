import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { print, deleteDiscMessage } from "../../../tools/f";
import { ActionType, QueueAction } from "./queue";

const commands = ['revertqueue', 'revert', 'rbq', 'reversepop', 'rollbackqueue'];

export class RollbackQueue extends BaseCommandClass {
  static instance: RollbackQueue = new RollbackQueue(commands);

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    const result = QueueAction.instance.rollbackQueueAction();
    if (result) {
      const printString = ActionType[result.type] + ': ' + result.users + (result.index !== undefined ? ' (Pos: ' + result.index + ')' : '');
      print(message, 'Rolled back action: ' + printString);
      deleteDiscMessage(message, 15000, 'rollbackqueue');
    }
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Rolls back latest queue action';
  }
}