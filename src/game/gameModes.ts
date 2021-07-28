import { initializePlayers } from "../database/db_sequelize";
import { balanceTeams } from "./balance";
import { Player } from "./player";

export enum GameModesStandard {
	CS = 'cs',
	DOTA = 'dota',
	VALORANT = 'valorant',
	TEST = 'test'
}

export enum GameModes1v1 {
	CS1v1 = 'cs1v1',
	DOTA1v1 = 'dota1v1',
	TEST1v1 = 'test1v1',
}

export enum GameModeRatings {
	TRIVIA = 'trivia',
	TRIVIA_TEMP = 'trivia_temp',
}

export type GameModesType = 
	GameModesStandard.CS |
	GameModesStandard.DOTA |
	GameModesStandard.VALORANT |
	GameModesStandard.TEST |
	GameModes1v1.CS1v1 | 
	GameModes1v1.DOTA1v1 |
	GameModes1v1.TEST1v1 |
	GameModeRatings.TRIVIA |
	GameModeRatings.TRIVIA_TEMP

export class GameModes {

	// TODO: Move to static functions in here
}

// Default choices is the first indexed mode
// TODO: Enum to list - Didn't find good way to do it since enum return keys and values
const modesGame = [GameModesStandard.CS, GameModesStandard.DOTA, GameModesStandard.VALORANT, GameModesStandard.TEST];
const modes1v1 = [GameModes1v1.CS1v1, GameModes1v1.DOTA1v1, GameModes1v1.TEST1v1];
const modesRatings = [GameModeRatings.TRIVIA, GameModeRatings.TRIVIA_TEMP]; // Trivia temp is used for ongoing games


export const getGameModes = () => {
  return modesGame;
};

// Dont return test game mode
export const getActiveGameModes = (): GameModesType[] => {
  const array = modesGame.slice();
  array.splice(modesGame.indexOf(GameModesStandard.TEST), 1);
  array.splice(modesGame.indexOf(GameModesStandard.VALORANT), 1);
  return array; // Dota is default
}

export const getGameModes1v1 = function () {
  return modes1v1;
};

export const getGameModesRatings = function () {
  return modesRatings;
};

export const getAllMMRModes = (): GameModesType[] => {
	let list: GameModesType[] = [];
	return list.concat(modesGame).concat(modes1v1);
}

export const getAllModes = (): GameModesType[] => {
	let list: GameModesType[] = [];
	return list.concat(modesGame).concat(modes1v1).concat(modesRatings);
};

export const ratingOrMMR = (game) => {
  if (modesGame.includes(game) || modes1v1.includes(game)) {
    return 'mmr';
  } if (modesRatings.includes(game)) {
    return 'rating';
  }
  throw new Error(`Invalid game @getSortedRating:${game}`);
};

// Returns first valid gamemode from arguments
// TODO: A way to set cs1v1 if cs is given or dota if dota1v1 is given (instead of default)
export const getModeChosen = (options, modeCategory, defaultGame?: GameModesType) => {
	let game = defaultGame; // default command (Either cs or cs1v1)
	for (let i = 1; i < options.length; i++){
		if (modeCategory.includes(options[i]) || modeCategory.includes(options[i] + '1v1')) {
			console.log('DEBUG @b Game chosen as: ' + options[i]);
			game = options[i];
			break;
		}
	}
	return game;
}

export const getModeAndPlayers = (players: Player[], gameObject, options, paramOptions: string[]) => {
	const { message, allModes } = options;
	let game;
	let skipServer;
	if (!message && !allModes) {
		game = options.game;
	} else {
		game = getModeChosen(paramOptions, allModes, allModes[0]);
	}
	skipServer = paramOptions.includes('noserver'); // Fix so default game does get noserver TODO
	// console.log('getModeAndPlayers', game);
	initializePlayers(players, game, (playerList: Player[]) => {
		balanceTeams(playerList, game, gameObject, skipServer);
	});
}

export const gameIsCS = (gameName: string) => gameName === GameModesStandard.CS || gameName === GameModes1v1.CS1v1;
export const gameIsCSMain = (gameName: string) => gameName === GameModesStandard.CS;
export const gameIsDota = (gameName: string) => gameName === GameModesStandard.DOTA || gameName === GameModes1v1.DOTA1v1;
export const gameIsTest = (gameName: string) => gameName === GameModesStandard.TEST || gameName === GameModes1v1.TEST1v1;