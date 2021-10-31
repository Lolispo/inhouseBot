import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { getInhouseFighterRoleId } from "../../channels/channels";
import { print } from "../../tools/f";

const commands = ['addinhousefighter', 'gladiator', 'fighter', 'roleme'];

export class AddInhouseFighterRole extends BaseCommandClass {
  static instance: AddInhouseFighterRole = new AddInhouseFighterRole(commands);

  action = (message: Message, options: string[]) => {
    const role = message.guild.roles.cache.find(role => role.id === getInhouseFighterRoleId());
    const member = message.guild.members.cache.get(message.author.id);
    if (member.roles.cache.find(roleParam => roleParam.id === role.id)) {
      print(message, `**${message.author.username}** already has the _Inhouse Fighter_ role!`);
    } else {
      member.roles.add(role);
      print(message, `Added **${message.author.username}** to the _Inhouse Fighter_ role!`);
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Adds the user to the Inhouse Fighter role';
  }
}

