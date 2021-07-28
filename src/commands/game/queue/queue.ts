import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { noop } from "../../../client";
import { print, deleteDiscMessage } from "../../../tools/f";

const commands = ['queue', 'startqueue'];

export class QueueAction extends BaseCommandClass {
  static instance: QueueAction = new QueueAction(commands);
  queue = [];

  static queueToString(queue?) {
    if (!queue) queue = QueueAction.instance.getCurrentQueue();
    if (queue.length === 0) return 'Current queue is empty.';
    return `Current queue: \n**${queue.join('**\n\t**')}**`;
  }

  getCurrentQueue() {
    return this.queue;
  }

  /**
   * Returns next player, undefined if noone in queue
   * Removes the player from the queue
   * @returns the next player in the queue
   */
  getNextPlayer() {
    return this.queue.shift();
  }

  addPlayerToQueue(author: string) {
    this.queue.push(author);
  }

  emptyQueue() {
    const previousQueue = this.queue.slice();
    console.log('Emptying Queue!', previousQueue);
    this.queue = [];
    return previousQueue;
  }

  removePlayerByUsername(username: string) {
    const index = this.queue.findIndex((userName) => userName === username);
    return this.queue.splice(index, 1);
  }

  /**
   * Adds current player to queue
   */
  action = (message: Message, options: string[]) => {
    const author = message.author.username;
    this.addPlayerToQueue(author);
    print(message, `**${author}** started queueing\n${QueueAction.queueToString()}`);
    deleteDiscMessage(message, 60000, 'queue');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Start queueing to show that you are interested in inhouse game';
  }
}