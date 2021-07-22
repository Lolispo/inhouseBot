import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { deleteDiscMessage, print  } from "../../tools/f";
import { getPrefix } from "../../tools/load-environment";

const commands = ['lenny', 'lennyface', getPrefix() + 'lenny', getPrefix() + 'lennyface'];

export class LennyAction extends BaseCommandClass {
    static instance: LennyAction = new LennyAction(commands, { isActive: false, extenderSetsPrefix: true });

    action = (message: Message, options: string[]) => {
		  print(message, '( ͡° ͜ʖ ͡°)');
		  deleteDiscMessage(message, 15000, 'lenny');
    }

    help = () => {
        return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Make the bot print a lennyface';
    }
}