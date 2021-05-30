import { initializePlayers } from "../database/db_sequelize";
import { balanceTeams } from "./balance";

// Default choices is the first indexed mode
export const modesGame = ['cs', 'dota', 'valorant', 'test'];
export const modes1v1 = ['cs1v1', 'dota1v1'];
export const modesRatings = ['trivia', 'trivia_temp']; // Trivia temp is used for ongoing games


export const getGameModes = function () {
  return modesGame;
};

// Dont return test game mode
export const getActiveGameModes = () => {
  const array = modesGame.slice();
  array.splice(modesGame.indexOf('test'), 1);
  array.splice(modesGame.indexOf('valorant'), 1);
  return array;
}

export const getGameModes1v1 = function () {
  return modes1v1;
};

export const getOtherRatings = function () {
  return modesRatings;
};

export const getAllModes = function () { // Default option should still be 'cs', TODO Check
  return modesGame.concat(modes1v1).concat(modesRatings);
};

export const ratingOrMMR = function (game) {
  if (modesGame.includes(game) || modes1v1.includes(game)) {
    return 'mmr';
  } if (modesRatings.includes(game)) {
    return 'rating';
  }
  throw new Error(`Invalid game @getSortedRating:${game}`);
};

// Returns first valid gamemode from arguments
// TODO: A way to set cs1v1 if cs is given or dota if dota1v1 is given (instead of default)
export const getModeChosen = (options, modeCategory, defaultGame = null) => {
	let game = defaultGame; // default command (Either cs or cs1v1)
	for (let i = 1; i < options.length; i++){
		if (modeCategory.includes(options[i])) {
			console.log('DEBUG @b Game chosen as: ' + options[i]);
			game = options[i];
			break;
		}
	}
	return game;
}

export const getModeAndPlayers = (players, gameObject, options, paramOptions: string[]) => {
	const { message, allModes } = options;
	let game;
	if (!message && !allModes) {
		game = options.game;
	} else {
		game = getModeChosen(paramOptions, allModes, allModes[0]);
	}
	const skipServer = paramOptions.includes('noserver');
	// console.log('getModeAndPlayers', game);
	initializePlayers(players, game, (playerList) => {
		balanceTeams(playerList, game, gameObject, skipServer);
	});
}