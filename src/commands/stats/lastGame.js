const db_sequelize = require('../database/db_sequelize');
const f = require('../tools/f');	
const { getConfig } = require('../tools/load-environment');
const bot = require('../bot');

const { prefix } = getConfig();
exports.lastGameCommands = [prefix + 'lastgame', prefix + 'latestgame'];

const printListOfPlayer = list => {
  return list.join('\n');
}

const playerString = (player, won) => {
  return `${won ? `**${player.userName}**` : player.userName} ${player.mmrChange >= 0 ? '+': ''}${player.mmrChange}`;
}

exports.lastGameAction = async (message, options) => {
  console.log('@lastGameCommand', message.content, options);
  const author = message.author.id;
  let result;
  if(options.length >= 2) {
    let gameName = options[1];
    console.log('@lastGame gameName:', gameName);
    result = await db_sequelize.lastGame(author, gameName);
  } else {
    result = await db_sequelize.lastGame(author);
  }
  if (typeof result === 'string') {
    bot.printMessage(result, message, (messageParam) => {
      f.deleteDiscMessage(messageParam, 120000, 'lastGame');
    });
  } else {    
    let stringResult = '';
    stringResult += `**${result.gameName}**: ${result.result === 1 ? `**${result.team1Name}**` : `${result.team1Name}`} - ${result.result === 2 ? `**${result.team2Name}**` : `${result.team2Name} Results: ${result?.score || ''} ${result?.mapName || ''}`}
  \`\`\`${printListOfPlayer(result.players.team1.map(el => playerString(el)))}
${printListOfPlayer(result.players.team2.map(el => playerString(el)))}\`\`\`
    `
    bot.printMessage(stringResult, message, (messageParam) => {
      f.deleteDiscMessage(messageParam, 120000, 'lastGame');
    });
  }
}