import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { MatchMode } from "../../BaseCommand/BaseCommandTypes";
import { noop } from "../../client";
import { deleteDiscMessage, print  } from "../../tools/f";

const commands = ['roll'];

export class RollAction extends BaseCommandClass {
    static instance: RollAction = new RollAction(commands, { matchMode: MatchMode.STARTS_WITH });

    roll(message, start: number, end: number) {
      const roll = Math.floor((Math.random() * (end - start))) + start;
      if (end === roll && (end - start) > 50) { // Only saves message if diff at least 50
        print(message, `**${message.author.username} rolled a ${roll} (${start} - ${end})**`, noop);
      } else if (roll > (start + (end - start) / 2)) { // Majority roll gets bold
        print(message, `${message.author.username} rolled a **${roll}** (${start} - ${end})`);
      } else {
        print(message, `${message.author.username} rolled a ${roll} (${start} - ${end})`);
      }
      deleteDiscMessage(message, 10000, 'roll');
    }

    action = (message: Message, options: string[]) => {
      if (options.length === 2 && !isNaN(parseInt(options[1]))) { // Valid input
        this.roll(message, 0, parseInt(options[1]));
      } else if (options.length === 3 && !isNaN(parseInt(options[1])) && !isNaN(parseInt(options[2]))) { // Valid input
        this.roll(message, parseInt(options[1]), parseInt(options[2]));
      } else {
        this.roll(message, 0, 100);
      }
    }

    help = () => {
        return '**' + this.commands.toString().replace(/,/g, ' | ') + '** [high] [low, high] Rolls a number between low and high. Default: (0 - 100)';
    }
}
