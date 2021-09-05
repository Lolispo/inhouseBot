import { Message } from "discord.js";
import { AdditionalParams, BaseCommandClass } from "../../../BaseCommand";
import { HelpMode, MatchMode } from "../../../BaseCommandTypes";
import { deleteDiscMessage } from "../../../tools/f";
import { unite } from "../../../voiceMove";

const commands = ['u', 'unite']

export class UniteAction extends BaseCommandClass {
  static instance: UniteAction = new UniteAction(commands, { isActive: true, matchMode: MatchMode.STARTS_WITH, requireActiveGame: true });

  action = (message: Message, options: string[], additionalParams: AdditionalParams) => {
    const { gameObject } = additionalParams;
    unite(message, options, gameObject.getActiveMembers());
    deleteDiscMessage(message, 15000, 'u');
  }

  // Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
  help = (helpMode: HelpMode) => {
    if (helpMode === HelpMode.DETAILED) {
      return '**' + this.commands.toString().replace(/,/g, ' | ') + '** [channelName] Unite voice chat after game.'
			+ ' Opt. argument: name of voice channel to unite in';
    }
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Take every user in Team1 and Team2 and move them to the same voice chat';
  }
}
