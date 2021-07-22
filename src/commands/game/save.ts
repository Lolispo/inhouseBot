import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { getGame, saveGame } from "../../game/game";
import { print } from "../../tools/f";

const commands = ['save']

export class SaveAction extends BaseCommandClass {
  static instance: SaveAction = new SaveAction(commands, { isActive: false });

  action = (message: Message, options: string[]) => {
    const gameObject = getGame(message.author);
    if (!gameObject) {
      print(message, 'Failed to save since user is not in a game');
    } else {
      const data = saveGame(gameObject);
      console.log('@saveAction: Saved game successfully');
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Save current game to file';
  }
}
