'use strict';
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data
*/
// Default choices is the first indexed mode
const modesGame = ['cs','dota'];
const modes1v1 = ['cs1v1', 'dota1v1'];
const modesRatings = ['trivia', 'trivia_temp'];
const startMMR = 2500;

function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = startMMR; 	
	this.mmrs = new Map();
	// Initializes mmr values to defaults. Ran instantly on creation
	this.initializeDefaultMMR = function(){
		for(var i = 0; i < modesGame.length; i++){
			var struct = new mmrStruct(startMMR);
			this.mmrs.set(modesGame[i], struct);
		}
		for(var i = 0; i < modes1v1.length; i++){
			var struct = new mmrStruct(startMMR);
			this.mmrs.set(modes1v1[i], struct);
		}
		for(var i = 0; i < modesRatings.length; i++){
			var struct = new mmrStruct(0);
			this.mmrs.set(modesRatings[i], struct);
		}	
	}

	this.setMMR = function(game, value){
		var struct = this.mmrs.get(game);
		struct.prevMMR = struct.mmr; // Keeps track of last recorded mmr
		struct.mmr = value;
	}

	this.getMMR = function(game){
		return this.mmrs.get(game).mmr;
	}

	this.getGame = function(game){
		return this.mmrs.get(game);
	}

	this.setMMRChange = function(game, value){
		var struct = this.mmrs.get(game);
		struct.latestUpdate = value;
	}

	this.setPlusMinus = function(game, value){
		var struct = this.mmrs.get(game);
		struct.latestUpdatePrefix = value;
	}
	this.initializeDefaultMMR();
}

// MMR struct - holding information about mmr for a game, used in map to map game with struct
function mmrStruct(startMmr){
	this.mmr = startMmr;
	this.prevMMR = startMmr; 		// MMR at previous instance
	this.latestUpdate = 0;			// How much mmr was changed
	this.latestUpdatePrefix = ''; 	// A '+' or ''?
}

// Used to initiate players, returns a player 'object'
var createPlayer = function(username, discId){
	return new Player(username, discId);
}

var getGameModes = function(){
	return modesGame;
}

var getGameModes1v1 = function(){
	return modes1v1;
}

var getOtherRatings = function(){
	return modesRatings;
}

var getAllModes = function(){ // Default option should still be 'cs', TODO Check
	return modesGame.concat(modes1v1).concat(modesRatings);
}


// Returns highest mmr player object from team
var getHighestMMR = function(team, game){
	var highestMMR = -1;
	var index = -1;
	for(var i = 0; i < team.length; i++){
		if(team[i].getMMR(game) > highestMMR){
			highestMMR = team[i].getMMR(game);
			index = i;
		}
	}
	return team[index];
}

// Return a player with given id from the array
// @return correctplayer if it exists or undefined
var getPlayer = function(array, uid){
	var correctPlayer = array.find(function(player){ // TODO: Check me
		return player.uid === uid
	});
	return correctPlayer;
}

// TODO Add sort on DESC Game (Used in trivia result currently)
var getSortedRatingTrivia = function(players){
	var s = '';
	var game = 'trivia';
	var game_temp = 'trivia_temp';
	players = sortRating(players, game_temp);
	for(var i = 0; i < players.length; i++){
		s += players[i].userName + "'s **" + game + '** ' + ratingOrMMR(game) + ': **' + players[i].getMMR(game_temp) + '** (Total: ' + players[i].getMMR(game) + ')\n';
	}
	return s;
}

// Insertion sort on the players on a given rating
var sortRating = function(players, game){
	for(var i = 0; i < players.length; i++){
		var tempPlayer = players[i];
		for(var j = i - 1; j > -1 && players[j].getMMR(game) < tempPlayer.getMMR(game); j--){
			players[j + 1] = players[j];
	    }
	    players[j + 1] = tempPlayer;
	}
	return players;
}

var ratingOrMMR = function(game){
	if(modesGame.includes(game) || modes1v1.includes(game)){
		return 'mmr';
	} else if(modesRatings.includes(game)){
		return 'rating';
	} else {
		throw err('Invalid game @getSortedRating', game);
	}
}

module.exports = {
	getHighestMMR : getHighestMMR,
	getPlayer : getPlayer,
	getSortedRatingTrivia : getSortedRatingTrivia,
	ratingOrMMR : ratingOrMMR,
	createPlayer : createPlayer,
	getGameModes : getGameModes,
	getGameModes1v1 : getGameModes1v1,
	getOtherRatings : getOtherRatings,
	getAllModes : getAllModes
}