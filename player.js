'use strict';
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data
*/
const gameModes = ['cs','dota', 'cs1v1', 'dota1v1'];
const otherRatings = ['trivia'];
const startMMR = 2500;

function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = startMMR; 	
	this.mmrs = new Map();
	// Initializes mmr values to defaults. Ran instantly on creation
	this.initializeDefaultMMR = function(){
		for(var i = 0; i < gameModes.length; i++){
			var struct = new mmrStruct(startMMR);
			this.mmrs.set(gameModes[i], struct);
		}
		for(var i = 0; i < otherRatings.length; i++){
			var struct = new mmrStruct(0);
			this.mmrs.set(otherRatings[i], struct);
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
	return gameModes;
}

var getOtherRatings = function(){
	return otherRatings;
}


// Returns highest mmr player object from team
var getHighestMMR = function(team, game){
	var highestMMR = -1;
	var index = -1;
	for(var i = 0; i < team.size(); i++){
		if(team[i].getMMR(game).mmr > highestMMR){
			highestMMR = team[i].getMMR(game).mmr;
			index = i;
		}
	}
	return team[index];
}

// Return a player with given id from the array
var getPlayer = function(array, uid){
	var correctPlayer = '';
	array.forEach(function(player){
		if(player.uid === uid){
			correctPlayer = player;
		}
	});
	return correctPlayer;
}

// TODO Add sort on DESC Game (Used in trivia result currently)
var getSortedRating = function(players, game){
	var s = '';
	for(var i = 0; i < players.size(); i++){
		s += players[i].userName + "'s **" + game + '** ' + ratingOrMMR(game) + ': ' + players[i].getMMR(game) + '\n'; // trivia
	}
	return s;
}

var ratingOrMMR = function(game){
	if(gameModes.includes(game)){
		return 'mmr';
	} else if(otherRatings.includes(game)){
		return 'rating';
	} else {
		throw err('Invalid game @getSortedRating', game);
	}
}

module.exports = {
	getHighestMMR : getHighestMMR,
	getPlayer : getPlayer,
	getSortedRating : getSortedRating,
	ratingOrMMR : ratingOrMMR,
	createPlayer : createPlayer,
	getGameModes : getGameModes,
	getOtherRatings : getOtherRatings
}