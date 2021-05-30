
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data
*/

import { modes1v1, modesGame, modesRatings, ratingOrMMR } from "./gameModes";

const startMMR = 2500;

export class Player {
	userName;
	uid;
	defaultMMR;
	steamId;
	mmrs;
	
	constructor(username, discId) {
		this.userName = username;
		this.uid = discId;
		this.defaultMMR = startMMR;
		this.steamId = '';
		this.mmrs = new Map();
		this.initializeDefaultMMR();
	}
  // Initializes mmr values to defaults. Ran instantly on creation
  initializeDefaultMMR = function () {
    for (let i = 0; i < modesGame.length; i++) {
      const struct = new mmrStruct(startMMR);
      this.mmrs.set(modesGame[i], struct);
    }
    for (let i = 0; i < modes1v1.length; i++) {
      const struct = new mmrStruct(startMMR);
      this.mmrs.set(modes1v1[i], struct);
    }
    for (let i = 0; i < modesRatings.length; i++) {
      const struct = new mmrStruct(0);
      this.mmrs.set(modesRatings[i], struct);
    }
  };

  setMMR = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.prevMMR = struct.mmr; // Keeps track of last recorded mmr
    struct.mmr = value;
  };

  getMMR (game): number {
    return this.mmrs.get(game).mmr;
  }

  getGame = function (game) {
    return this.mmrs.get(game);
  };

  setMMRChange = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.latestUpdate = value;
  };

  setPlusMinus = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.latestUpdatePrefix = value;
  };

  setSteamId = (steamid) => {
    this.steamId = steamid;
  };

  getSteamId = () => this.steamId;
}

// MMR struct - holding information about mmr for a game, used in map to map game with struct
function mmrStruct(startMmr) {
  this.mmr = startMmr;
  this.prevMMR = startMmr; 		// MMR at previous instance
  this.latestUpdate = 0;			// How much mmr was changed
  this.latestUpdatePrefix = ''; 	// A '+' or ''?
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
export const sortRating = function (players, game) {
	// TODO: Verify working as intended in Trivia flow
	players = players.sort((a, b) => {
		return a.getMMR(game) - b.getMMR(game);
	});
  return players;
};

export function getAllModes() {
	throw new Error('Function not implemented.');
}

export function getGameModes() {
	throw new Error('Function not implemented.');
}

