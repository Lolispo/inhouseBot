
import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { initSocketConnection, startMatch } from "../../dota/socketClient";

const commands = ['connectdota']

export class ConnectDotaAction extends BaseCommandClass {
  static instance: ConnectDotaAction = new ConnectDotaAction(commands);
  static socketConfiguration;

  action = async (message: Message, options: string[]) => {
    console.log('@dota action:', )
    try {
      const configureSocket = initSocketConnection();
      ConnectDotaAction.socketConfiguration = configureSocket();
      startMatch({ hello: 'world' });
    } catch (e) {
      console.error('Issue with socket connection ...', e);
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' Connect to dota bot\n';
  }
}
