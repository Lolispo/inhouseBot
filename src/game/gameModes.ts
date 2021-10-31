import { initializePlayers } from "../database/db_sequelize";
import { balanceTeams } from "./balance";
import { Game } from "./game";
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

interface FoundMode {
	game: GameModesType;
	defaultMode: boolean;
}

// Returns first valid gamemode from arguments
// TODO: A way to set cs1v1 if cs is given or dota if dota1v1 is given (instead of default)
export const getModeChosen = (options, modeCategory, defaultGame?: GameModesType): FoundMode => {
	let game = defaultGame; // default command (Either cs or cs1v1)
	let isDefaultGame = true;
	for (let i = 1; i < options.length; i++){
		if (modeCategory.includes(options[i]) || modeCategory.includes(options[i] + '1v1')) {
			console.log('DEBUG @b Game chosen as: ' + options[i]);
			game = options[i];
			isDefaultGame = false;
			break;
		}
	}
	return { game, defaultMode: isDefaultGame };
}

/**
 * Get game mode from options
 * Check if hosted server should be used or handled manually
 * Initalizes players so they are available in database
 * balances game
 * @param players list of players
 * @param gameObject created gameobject that game should be created on
 * @param options { message: message sent, allModes: allowed game modes }
 * @param paramOptions options given to the command
 */
export const getModeAndPlayers = (players: Player[], gameObject: Game, options, paramOptions: string[]) => {
	const { message, allModes } = options;
	let game;
	let skipServer;
	let defaultGame = true;
	if (!message && !allModes) {
		game = options.game;
	} else {
		const res = getModeChosen(paramOptions, allModes, allModes[0]);
		game = res.game;
		defaultGame = res.defaultMode;
	}
	skipServer = paramOptions.includes('noserver') || defaultGame; // Default game does not get server
	// console.log('getModeAndPlayers', game);
	initializePlayers(players, game, (playerList: Player[]) => {
		balanceTeams(playerList, game, gameObject, skipServer);
	});
}

export const gameIsCS = (gameName: string) => gameName === GameModesStandard.CS || gameName === GameModes1v1.CS1v1;
export const gameIsCSMain = (gameName: string) => gameName === GameModesStandard.CS;
export const gameIsDota = (gameName: string) => gameName === GameModesStandard.DOTA || gameName === GameModes1v1.DOTA1v1;
export const gameIsTest = (gameName: string) => gameName === GameModesStandard.TEST || gameName === GameModes1v1.TEST1v1;