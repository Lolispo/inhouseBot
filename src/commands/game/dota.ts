
import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand";
import { initSocketConnection, startMatch } from "../../dota/socketClient";

const commands = ['connectdota']

enum DOTA_GC_TEAM {
  GOOD_GUYS = 0,
  BAD_GUYS = 1,
  BROADCASTER = 2,
  SPECTATOR = 3,
  PLAYER_POOL = 4,
  NOTEAM = 5
}
interface IDotaStartMatch {
  [DOTA_GC_TEAM.GOOD_GUYS]: number[],
  [DOTA_GC_TEAM.BAD_GUYS]: number[],
}
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

  static convertTeamsToDotaApiFormat = (teams): IDotaStartMatch => {
    console.log('@convert:', teams);
    return {
      [DOTA_GC_TEAM.GOOD_GUYS]: teams.team1,
      [DOTA_GC_TEAM.BAD_GUYS]: teams.team2,
    };
  }

  static startMatch = async (teams) => {
    try {
      await ConnectDotaAction.getSocket();
      const convertedTeams = ConnectDotaAction.convertTeamsToDotaApiFormat(teams);
      console.log('Sending Teams ...');
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
