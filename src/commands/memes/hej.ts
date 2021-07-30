import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { MatchMode } from "../../BaseCommandTypes";
import { print } from "../../tools/f";
import { noop } from '../../client';

const commands = ['hej'];

export class HejAction extends BaseCommandClass {
  static instance: HejAction = new HejAction(commands, { matchMode: MatchMode.STARTS_WITH, includeHelpCommand: false, extenderSetsPrefix: true });

  action = (message: Message, options: string[]) => {
    if (message.author.username) {
      print(message, 'Hej ' + message.author.username, noop); // Not removing hej messages
    }
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** The bot greets you';
  }
}