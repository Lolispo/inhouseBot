import { getHighScore } from "../../database/db_sequelize";
import { getAllModes, getModeChosen, ratingOrMMR } from "../../game/gameModes";
import { deleteDiscMessage, print } from "../../tools/f";

// TODO: Migrate to format
export const leaderBoardAction = async (message, options) => {
  const allModes = getAllModes();
  const { game } = getModeChosen(options, allModes, allModes[0]);
  let size = 5; 
  if (options.length >= 2) { // TODO: Test 1
    let num;
    for (let i = 0; i < options.length; i++) {
      num = parseInt(options[i]);
      if (isNaN(num)) continue;
      size = num > 0 && num <= 100 ? num : 5;
      break;
    }
  }
  const data = await getHighScore(game, size);
  // TODO: Print``
  let s2 = '';
  let counter = 0;
  const filteredData = data.forEach(playerStats => {
    return playerStats?.gamesPlayed >= 5; 
  })
  filteredData.forEach((playerStats) => {
    counter++;
    const playerNameRating = `${playerStats.userName.replace('_', '\\_')}: \t**${playerStats.mmr} ${ratingOrMMR(playerStats.gameName)}**`;
    const gamesPlayed = playerStats.gamesPlayed > 0 ? `\t(Games Played: ${playerStats.gamesPlayed})` : '';
    s2 += `${playerNameRating}${gamesPlayed}\n`;
  });
  let s = '**Leaderboard Top ' + size + (size !== counter ? ` (${counter})` : '') + ' for ' + game + ':**\n';
  s += s2;
  print(message, s);
  deleteDiscMessage(message, 15000, 'leaderboard');
}