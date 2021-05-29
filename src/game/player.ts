
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data
*/
// Default choices is the first indexed mode
const modesGame = ['cs', 'dota', 'valorant', 'test'];
const modes1v1 = ['cs1v1', 'dota1v1'];
const modesRatings = ['trivia', 'trivia_temp'];
const startMMR = 2500;

function Player(username, discId) {
  this.userName = username;
  this.uid = discId;
  this.defaultMMR = startMMR;
  this.steamId = '';
  this.mmrs = new Map();
  // Initializes mmr values to defaults. Ran instantly on creation
  this.initializeDefaultMMR = function () {
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

  this.setMMR = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.prevMMR = struct.mmr; // Keeps track of last recorded mmr
    struct.mmr = value;
  };

  this.getMMR = function (game) {
    return this.mmrs.get(game).mmr;
  };

  this.getGame = function (game) {
    return this.mmrs.get(game);
  };

  this.setMMRChange = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.latestUpdate = value;
  };

  this.setPlusMinus = function (game, value) {
    const struct = this.mmrs.get(game);
    struct.latestUpdatePrefix = value;
  };

  this.setSteamId = (steamid) => {
    this.steamId = steamid;
  };

  this.getSteamId = () => this.steamId;

  this.initializeDefaultMMR();
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

export const getGameModes = function () {
  return modesGame;
};

export const getGameModes1v1 = function () {
  return modes1v1;
};

export const getOtherRatings = function () {
  return modesRatings;
};

export const getAllModes = function () { // Default option should still be 'cs', TODO Check
  return modesGame.concat(modes1v1).concat(modesRatings);
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
  const game = 'trivia';
  const game_temp = 'trivia_temp';
  players = sortRating(players, game_temp);
  for (let i = 0; i < players.length; i++) {
    s += `${players[i].userName}'s **${game}** ${ratingOrMMR(game)}: **${players[i].getMMR(game_temp)}** (Total: ${players[i].getMMR(game)})\n`;
  }
  return s;
};

// Insertion sort on the players on a given rating
export const sortRating = function (players, game) {
  for (let i = 0; i < players.length; i++) {
    const tempPlayer = players[i];
    for (let j = i - 1; j > -1 && players[j].getMMR(game) < tempPlayer.getMMR(game); j--) {
      players[j + 1] = players[j];
	    }
	    players[j + 1] = tempPlayer;
  }
  return players;
};

export const ratingOrMMR = function (game) {
  if (modesGame.includes(game) || modes1v1.includes(game)) {
    return 'mmr';
  } if (modesRatings.includes(game)) {
    return 'rating';
  }
  throw new Error(`Invalid game @getSortedRating:${game}`);
};
