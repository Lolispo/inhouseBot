import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { IMessageType } from "../../BaseCommandTypes";
import { buildHelpString, removeBotMessageDefaultTime } from "../../bot";
import { buildStringHelpAllCommands } from "../../mainCommand";
import { deleteDiscMessage } from "../../tools/f";

const commands = ['help', 'h'];

export class HelpAction extends BaseCommandClass {
  static instance: HelpAction = new HelpAction(commands, { allowedMessageTypes: [IMessageType.DIRECT_MESSAGE, IMessageType.SERVER_MESSAGE] });

  action = (message: Message, options: string[]) => {
    const helpMessage = buildStringHelpAllCommands();
    const deprecatedCommands = buildHelpString(message.author.id, 0);
    message.author.send(helpMessage)
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 2, 'help');
      });
    message.author.send(deprecatedCommands)
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 2, 'helpdep');
      });
    deleteDiscMessage(message, 10000, 'helpaction');
    return true;
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Sends available commands privately to the user.';
  }
}
