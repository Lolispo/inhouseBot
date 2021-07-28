import { lastGame } from '../../database/db_sequelize';
import * as f from '../../tools/f';	
import { getConfig } from '../../tools/load-environment';
import { printMessage } from '../../bot';
import { Message } from 'discord.js';
import { BaseCommandClass } from '../../BaseCommand';
import { MatchMode } from '../../BaseCommandTypes';

export const commands = ['lastgame', 'latestgame'];

export class LastGameAction extends BaseCommandClass {
  static instance: LastGameAction = new LastGameAction(commands, { matchMode: MatchMode.STARTS_WITH });

  printListOfPlayer = list => {
    return list.join('\n');
  }
  
  playerString = (player, won) => {
    return `${won ? `**${player.userName}**` : player.userName} ${player.mmrChange >= 0 ? '+': ''}${player.mmrChange}`;
  }

  action = async (message: Message, options: string[]) => {
    console.log('@lastGameCommand', message.content, options);
    const author = message.author.id;
    let result;
    if (options.length >= 2) {
      const gameName = options[1];
      console.log('@lastGame gameName:', gameName);
      result = await lastGame(author, gameName);
    } else {
      result = await lastGame(author);
    }
    if (typeof result === 'string') {
      printMessage(result, message, (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'lastGame');
      });
    } else {    
      let stringResult = '';
      stringResult += `**${result.gameName}**: ${result.result === 1 ? `**${result.team1Name}**` : `${result.team1Name}`} - ${result.result === 2 ? `**${result.team2Name}**` : `${result.team2Name} Results: ${result?.score || ''} ${result?.mapName || ''}`}
${this.printListOfPlayer(result.players.team1.map(el => this.playerString(el, result.result === 1)))}
${this.printListOfPlayer(result.players.team2.map(el => this.playerString(el, result.result === 2)))}
      `
      printMessage(stringResult, message, (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'lastGame');
      });
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' [gameName]** Shows winners and losers for the latest game you played. ' + 
    'If no argument is provided, returns latest overall, otherwise latest for the specified game';
  }
}


