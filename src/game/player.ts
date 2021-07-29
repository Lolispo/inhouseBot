
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data
*/

import { modes1v1, modesGame, modesRatings, ratingOrMMR } from "./gameModes";
import { MMRStruct } from "./mmrStruct";

const startMMR = 2500;

export class Player {
	userName;
	uid;
	defaultMMR;
	steamId;
	mmrs: { [key: string] : MMRStruct };
	
	constructor(username, discId) {
		this.userName = username;
		this.uid = discId;
		this.defaultMMR = startMMR;
		this.steamId = '';
		this.mmrs = { };
		this.initializeDefaultMMR();
	}
  // Initializes mmr values to defaults. Ran instantly on creation
  initializeDefaultMMR = () => {
    for (let i = 0; i < modesGame.length; i++) {
      const struct = MMRStruct.generateMmrStruct(startMMR);
      this.mmrs[modesGame[i]] = struct;
    }
    for (let i = 0; i < modes1v1.length; i++) {
      const struct = MMRStruct.generateMmrStruct(startMMR);
      this.mmrs[modes1v1[i]] = struct;
    }
    for (let i = 0; i < modesRatings.length; i++) {
      const struct = MMRStruct.generateMmrStruct(0);
      this.mmrs[modesRatings[i]], struct;
    }
  };

  setMMR = (game, value) => {
    const struct = this.mmrs[game] || MMRStruct.generateMmrStruct(undefined);
    struct.prevMMR = struct?.mmr; // Keeps track of last recorded mmr
    struct.mmr = value;
  };

  getMMR (game): number {
    return this.mmrs[game].mmr;
  }

  getGame = (game) => {
    return this.mmrs[game];
  };

  setMMRChange = (game, value) => {
    const struct = this.mmrs[game];
    struct.latestUpdate = value;
  };

  setPlusMinus = (game, value) => {
    const struct = this.mmrs[game];
    struct.latestUpdatePrefix = value;
  };

  setSteamId = (steamid) => {
    this.steamId = steamid;
  };

  getSteamId = () => this.steamId;
}

// Used to initiate players, returns a player 'object'
export const createPlayer = function (username, discId) {
  return new Player(username, discId);
};

// Returns highest mmr player object from team
export const getHighestMMR = function (team, game) {
  let highestMMR = -1;
  let index = -1;
  for (let i = 0; i < team.length; i++) {
    if (team[i].getMMR(game) > highestMMR) {
      highestMMR = team[i].getMMR(game);
      index = i;
    }
  }
  console.log('Highest mmr for team', highestMMR, team[index].userName);
  return team[index];
};

// Return a player with given id from the array
// @return correctplayer if it exists or undefined
export const getPlayer = function (array, uid) {
  const correctPlayer = array.find(player => // TODO: Check me
		 player.uid === uid);
  return correctPlayer;
};

// TODO Add sort on DESC Game (Used in trivia result currently)
export const getSortedRatingTrivia = function (players) {
  let s = '';
  const game = 'trivia';						// Global Trivia Score
  const game_temp = 'trivia_temp'; 	// Current game
  players = sortRating(players, game_temp);
  for (let i = 0; i < players.length; i++) {
    s += `${players[i].userName}'s **${game}** ${ratingOrMMR(game)}: **${players[i].getMMR(game_temp)}** (Total: ${players[i].getMMR(game)})\n`;
  }
  return s;
};

// Insertion sort on the players on a given rating
export const sortRating = (players: Player[], game: string) => {
	players = players.sort((a: Player, b: Player) => {
		return b.getMMR(game) - a.getMMR(game);
	});
  // console.log('@sortRating:', players.map(player => player.getMMR(game)));
  return players;
};

export function getAllModes() {
	throw new Error('Function not implemented.');
}

export function getGameModes() {
	throw new Error('Function not implemented.');
}

