import { Message } from "discord.js";
import { AdditionalParams, BaseCommandClass } from "../../../BaseCommand";
import { deleteDiscMessage } from "../../../tools/f";
import { split } from "../../../voiceMove";

const commands = ['split']

export class SplitAction extends BaseCommandClass {
  static instance: SplitAction = new SplitAction(commands, { isActive: true, requireActiveGame: true });

  action = (message: Message, options: string[], additionalParams: AdditionalParams) => {
    const { gameObject } = additionalParams;
    split(message, options, gameObject.getBalanceInfo(), gameObject.getActiveMembers());
    deleteDiscMessage(message, 15000, 'split');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Splits the players playing into the Voice Channels Team1 and Team2';
  }
}
