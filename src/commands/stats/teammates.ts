import { bestTeammates, lastGame, Statistics } from '../../database/db_sequelize';
import * as f from '../../tools/f';	
import { getConfig } from '../../tools/load-environment';
import { printMessage } from '../../bot';
import { getGameModes, getModeChosen } from '../../game/gameModes';
import { Message } from 'discord.js';
import { BaseCommandClass, MatchMode } from '../../BaseCommand';

export const commands = ['teammates', 'friends'];

export class TeammateAction extends BaseCommandClass {
  static instance: TeammateAction = new TeammateAction(commands, { matchMode: MatchMode.STARTS_WITH });

  printListOfPlayer = list => {
    return list.join('\n');
  }
  
  playerString = (result: Statistics): string => {
    return `GamesPlayed: ${f.padString(result.gamesPlayed, 3)} WinRate: ${f.padString(f.prettifyPercentage(result.winRate) + '%')} (Wins: ${f.padString(result.wins, 2)}, Losses: ${f.padString(result.losses, 2)}) ${result.userName}`;
  }
  
  buildResults = (author: string, gameName: string, result: Statistics[]): string => {
    let stringResult = '';
    stringResult += `**Teammate results for ${author} in ${gameName}**
  \`\`\`${this.printListOfPlayer(result.map(player => this.playerString(player)))}\`\`\`
    `
    return stringResult;
  }
  action = async (message: Message, options: string[]) => {
    console.log('@teammateAction', message.content, options);
    const author = message.author.id;
    const gameName = getModeChosen(options, getGameModes(), 'dota');
    const result: Statistics[] = await bestTeammates(author, gameName);
    if (result) {
      if (options[1] === 'games' || options[2] === 'games') {
        result.sort((a,b) => {
          if (b.gamesPlayed - a.gamesPlayed === 0) {
            return b.winRate - a.winRate;
          }
          return b.gamesPlayed - a.gamesPlayed;
        });
      }    
      const stringResult = this.buildResults(message.author.username, gameName, result);
      printMessage(stringResult, message, (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'teammates');
      });
    } else {
      printMessage('No matches available for this user in this game', message, (messageParam) => {
        f.deleteDiscMessage(messageParam, 120000, 'teammates');
      });
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + ' [gameName] [games]** Shows teammates score for given gameName, default sorted on winrate. Provide parameter "games" to sort in most played games together.';
  }
}


