import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { Game, loadFromFile } from "../../game/game";
import { print } from "../../tools/f";

const commands = ['load']

export class LoadAction extends BaseCommandClass {
  static instance: LoadAction = new LoadAction(commands, { isActive: false });

  action = async (message: Message, options: string[]) => {
    await loadFromFile();
    console.log('@loadAction:', Game.getActiveGamesToString());
    print(message, 'Loaded Game from local storage');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Load game from file';
  }
}
