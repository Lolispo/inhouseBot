
import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { initSocketConnection, startMatch } from "../../dota/socketClient";

const commands = ['connectdota']

export class ConnectDotaAction extends BaseCommandClass {
  static instance: ConnectDotaAction = new ConnectDotaAction(commands);
  static socketConfiguration;

  static getSocket = async () => {
    if (ConnectDotaAction.socketConfiguration) return ConnectDotaAction.socketConfiguration;
    try {
      const configureSocket = initSocketConnection();
      ConnectDotaAction.socketConfiguration = configureSocket();
      return ConnectDotaAction.socketConfiguration;
    } catch (e) {
      console.error('Issue with socket connection ...', e);
    }
  }

  startMatch = async (teams) => {
    try {
      await ConnectDotaAction.getSocket();
      console.log('Sending Teams ...');
      startMatch(teams);
    } catch (e) {
      console.error('Issue emitting startMatch Event ...', e);
    }
  }

  action = async (message: Message, options: string[]) => {
    try {
      await ConnectDotaAction.getSocket();
      console.log('Sending Hello World event ...');
      startMatch({ hello: 'world' });
    } catch (e) {
      console.error('Issue emitting startMatch test ...', e);
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' Connect to dota bot\n';
  }
}
