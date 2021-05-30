import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { loadFromFile } from "../../game/game";
import { print } from "../../tools/f";

const loadCommands = ['load']

export class LoadAction extends BaseCommandClass {
  static instance: LoadAction = new LoadAction(loadCommands);

  action = (message: Message, options: string[]) => {
    const game = loadFromFile();
    print(message, 'Loaded Game from local storage');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' Load game from file\n';
  }
}
