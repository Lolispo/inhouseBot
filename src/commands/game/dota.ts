
import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { DOTA_GC_TEAM, IDotaStartMatch } from "../../dota/dotatypes";
import { initSocketConnection, startMatch } from "../../dota/socketClient";

const commands = ['connectdota']

export class ConnectDotaAction extends BaseCommandClass {
  static instance: ConnectDotaAction = new ConnectDotaAction(commands);
  static socketConfiguration;
  static gameId: string;
  static matchIdResults: { [key: string]: boolean }; // Match id results;

  static setGameId = (value: string) => {
    ConnectDotaAction.gameId = value;
  }

  static getGameId = () => {
    return ConnectDotaAction.gameId;
  }

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

  static convertTeamsToDotaApiFormat = (teams): IDotaStartMatch => {
    console.log('@convert:', teams);
    return {
      [DOTA_GC_TEAM.GOOD_GUYS]: teams[0].map(player => player.steamId),
      [DOTA_GC_TEAM.BAD_GUYS]: teams[1].map(player => player.steamId),
    };
  }

  static startMatch = async (gameId, teams) => {
    try {
      await ConnectDotaAction.getSocket();
      const convertedTeams = ConnectDotaAction.convertTeamsToDotaApiFormat(teams);
      console.log('Sending Teams ...');
      ConnectDotaAction.setGameId(gameId);
      startMatch(convertedTeams);
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
