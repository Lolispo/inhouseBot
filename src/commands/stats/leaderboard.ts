import { getHighScore } from "../../database/db_sequelize";
import { getAllModes, getModeChosen, ratingOrMMR } from "../../game/gameModes";
import { deleteDiscMessage, print } from "../../tools/f";

export const leaderBoardAction = async (message, options) => {
  const allModes = getAllModes();
  const game = getModeChosen(options, allModes, allModes[0]);
  let size = 5; 
  if (options.length >= 2) {
    let num;
    for (let i = 0; i < options.length; i++) {
      try {
        num = parseInt(options[i]);
        size = num > 0 && num <= 100 ? num : 5;
      } catch (e) {
        // Do nothing
      }
    }
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