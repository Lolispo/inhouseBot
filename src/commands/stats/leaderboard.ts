import { getModeChosen } from "../../bot";
import { getHighScore } from "../../database/db_sequelize";
import { getAllModes, ratingOrMMR } from "../../game/player";
import { deleteDiscMessage, print } from "../../tools/f";

export const leaderBoardAction = async (message, options) => {
  const allModes = getAllModes();
  const game = getModeChosen(options, allModes, allModes[0]);
  let size = 5; 
  if (options.length >= 2) {
    const num = parseInt(options[1]);
    size = options[1] > 0 && options[1] <= 100 ? num : 5;
  }
  const data = await getHighScore(game, size);
  // TODO: Print``
  let s2 = '';
  let counter = 0;
  data.forEach((oneData) => {
    counter++;
    const playerNameRating = `${oneData.userName.replace('_', '\\_')}: \t**${oneData.mmr} ${ratingOrMMR(oneData.gameName)}**`;
    const gamesPlayed = oneData.gamesPlayed > 0 ? `\t(Games Played: ${oneData.gamesPlayed})` : '';
    s2 += `${playerNameRating}${gamesPlayed}\n`;
  });
  let s = '**Leaderboard Top ' + size + (size !== counter ? ` (${counter})` : '') + ' for ' + game + ':**\n';
  s += s2;
  print(message, s);
  deleteDiscMessage(message, 15000, 'leaderboard');
}