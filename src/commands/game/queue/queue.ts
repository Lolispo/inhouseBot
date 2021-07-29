import { Message, User } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { removeBotMessageDefaultTime } from "../../../bot";
import { print, deleteDiscMessage } from "../../../tools/f";

const commands = ['queue', 'startqueue'];

export enum ActionType {
  PUSH = 0,
  POP,
  REMOVE,
  EMPTY
}
interface Action {
  type: ActionType,
  users: User[],
  index?: number
}

export class QueueAction extends BaseCommandClass {
  static instance: QueueAction = new QueueAction(commands);
  queue: User[] = [];
  storedActions: Action[] = [];

  static queueToString(queue?) {
    if (!queue) queue = QueueAction.instance.getCurrentQueue();
    if (queue.length === 0) return 'Current queue is empty.';
    const userNames = queue.map(user => user.username);
    return `Current queue: \n**\t${userNames.join('**\n\t**')}**`;
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
    if (this.queue.length === 0) return undefined;
    const user = this.queue.shift();
    this.addAction({ type: ActionType.POP, users: [user] });
    return user;
  }

  addPlayerToQueue(user: User, message?: Message) {
    if (!this.queue.includes(user)) {
      this.addAction({ type: ActionType.PUSH, users: [user] });
      this.queue.push(user);
      console.log('Added user to queue:', user.username);
      if (message) { // Only prints if message available
        print(message, `**${user.username}** started queueing\n${QueueAction.queueToString()}`, (messageVar) => {
          deleteDiscMessage(messageVar, 60000, 'queueprint')
        });
      } else {
        user.send('**You have joined the queue to play Inhouse!\n**This was done by joining the Waiting Room channel. If you want to leave the queue, write -stopqueue')
          .then(result => {
            deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
          });
      }
    }
  }

  emptyQueue() {
    if (this.queue.length === 0) return [];
    const previousQueue = this.queue.slice();
    this.addAction({ type: ActionType.EMPTY, users: previousQueue });
    console.log('Emptying Queue!', previousQueue);
    this.queue = [];
    return previousQueue;
  }

  removePlayer(user: User) {
    const index = this.queue.findIndex(userQueue => userQueue.id === user.id);
    if (index === -1) return undefined;
    this.addAction({ type: ActionType.REMOVE, users: [user], index: index });
    return this.queue.splice(index, 1);
  }

  doAction(action: Action) {
    const users = action.users;
    if (action.type === ActionType.POP) {
      // Revert the pop, put user infront of the queue
      this.queue.unshift(users[0]);
    } else if (action.type === ActionType.PUSH) {
      // Remove user from end of queue
      const user = users[0];
      const index = this.queue.findIndex((userQueue) => userQueue.id === user.id)
      if (index === -1) return;
      this.queue.splice(index, 1);
    } else if (action.type === ActionType.EMPTY) {
      this.queue.concat(users);
    } else if (action.type === ActionType.REMOVE) {
      this.queue.splice(action.index, 0, action.users[0]);
    }
  }

  rollbackQueueAction() {
    const action = this.storedActions.pop();
    this.doAction(action);
    return action;
  }

  addAction(action: Action) {
    this.storedActions.push(action);
    if (this.storedActions.length >= 20) {
      this.storedActions.shift();
    }
  }

  /**
   * Adds current player to queue
   */
  action = (message: Message, options: string[]) => {
    const user = message.author;
    this.addPlayerToQueue(user, message);
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Start queueing to show that you are interested in inhouse game';
  }
}