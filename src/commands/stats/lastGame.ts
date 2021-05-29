const db_sequelize = require('../../database/db_sequelize');
import * as f from '../../tools/f';	
const { getConfig } = require('../../tools/load-environment');
import { printMessage } from '../../bot';

const { prefix } = getConfig();
export const lastGameCommands = [prefix + 'lastgame', prefix + 'latestgame'];

const printListOfPlayer = list => {
  return list.join('\n');
}

const playerString = (player, won) => {
  return `${won ? `**${player.userName}**` : player.userName} ${player.mmrChange >= 0 ? '+': ''}${player.mmrChange}`;
}

export const lastGameAction = async (message, options) => {
  console.log('@lastGameCommand', message.content, options);
  const author = message.author.id;
  let result;
  if (options.length >= 2) {
    const gameName = options[1];
    console.log('@lastGame gameName:', gameName);
    result = await db_sequelize.lastGame(author, gameName);
  } else {
    result = await db_sequelize.lastGame(author);
  }
  if (typeof result === 'string') {
    printMessage(result, message, (messageParam) => {
      f.deleteDiscMessage(messageParam, 120000, 'lastGame');
    });
  } else {    
    let stringResult = '';
    stringResult += `**${result.gameName}**: ${result.result === 1 ? `**${result.team1Name}**` : `${result.team1Name}`} - ${result.result === 2 ? `**${result.team2Name}**` : `${result.team2Name} Results: ${result?.score || ''} ${result?.mapName || ''}`}
  \`\`\`${printListOfPlayer(result.players.team1.map(el => playerString(el)))}
${printListOfPlayer(result.players.team2.map(el => playerString(el)))}\`\`\`
    `
    printMessage(stringResult, message, (messageParam) => {
      f.deleteDiscMessage(messageParam, 120000, 'lastGame');
    });
  }
}