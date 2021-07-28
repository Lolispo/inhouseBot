import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { HelpMode, IMessageType } from "../../BaseCommandTypes";
import { buildHelpString, removeBotMessageDefaultTime } from "../../bot";
import { buildStringHelpAllCommands } from "../../mainCommand";
import { deleteDiscMessage, print } from "../../tools/f";

const commands = ['ha', 'helpall', 'detailedhelp', 'advancedhelp'];

export class HelpAllAction extends BaseCommandClass {
  static instance: HelpAllAction = new HelpAllAction(commands, { allowedMessageTypes: [IMessageType.DIRECT_MESSAGE, IMessageType.SERVER_MESSAGE] });

  action = (message: Message, options: string[]) => {
    // Detailed help information
    const helpMessage = buildStringHelpAllCommands(HelpMode.DETAILED);
    const depDetailed1 = buildHelpString(message.author.id, 1);
    const depDetailed2 = buildHelpString(message.author.id, 1);
    message.author.send(helpMessage)
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
      });
      deleteDiscMessage(message, 10000, 'helpall');
    message.author.send(depDetailed1)
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
      });
      deleteDiscMessage(message, 10000, 'helpalldep2');
    message.author.send(depDetailed2)
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
      });
      deleteDiscMessage(message, 10000, 'helpalldep2');

    deleteDiscMessage(message, 10000, 'helpAll');
  }

  help = (helpMode?: HelpMode) => {
    if (helpMode === HelpMode.DETAILED) {
      return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Sends available commands privately to the user. Not all commands have a detailed version. ' +
       'For those commands then you will just see the default help message.';
    }
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Sends available commands privately to the user.';
  }
}
