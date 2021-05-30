import { removeBotMessageDefaultTime } from "../../bot";
import { getPersonalStats } from "../../database/db_sequelize";
import { getAllModes, getModeChosen, ratingOrMMR } from "../../game/gameModes";
import { deleteDiscMessage } from "../../tools/f";

export const statsAction = async (message, options) => {
  const game = getModeChosen(options, getAllModes());
	const data = await getPersonalStats(message.author.id);
	let s = '';
	if (data.length === 0){
		if (!game || game === '') {
			s += "**User doesn't have any games played**";
		} else {
			s += `**User doesn't have any ${game} games played**`;
		}
	}
	else {
		if (!game) {
			s += `**Your stats (${data[0].userName}):**\n`;
			data.forEach((oneData) => {
				s += `${oneData.gameName}: \t**${oneData.mmr} ${ratingOrMMR(oneData.gameName)}**\t(Games Played: ${oneData.gamesPlayed})\n`;
			});
		} else {
			s += '**Your stats for ' + game + ':**\n';
			const filteredData = data.filter((entry) => entry.gameName === game);
			filteredData.forEach((oneData) => {
				s += `${oneData.userName}(**${oneData.gameName}**): \t**${oneData.mmr} ${ratingOrMMR(game)}**\t(Games Played: ${oneData.gamesPlayed})\n`;
			});
		}
	}
	message.author.send(s)  // Private message
	.then(result => {
		deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
	}); 
}