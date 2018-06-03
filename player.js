'use strict';
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data

	TODO Feature: 
		Add dynamic storage of mmr for support of more games, potential of aim map skill 2v2
*/
const gameModes = ['cs','dota', 'cs1v1', 'dota1v1'];
const otherRatings = ['trivia'];
const startMMR = 2500;

function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = startMMR; 
	// TODO Store array of mmr instead, fetchable by game or something
	
	this.mmrs = new Map();

	// Initializes mmr values to defaults
	this.initializeMMR = function(){
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
	this.initializeMMR();
}

// MMR struct - holding information about mmr for a game, used in map to map game with struct
function mmrStruct(startMmr){
	this.mmr = startMmr;
	this.prevMMR = startMmr; 		// MMR at previous instance
	this.latestUpdate = 0;			// How much mmr was changed
	this.latestUpdatePrefix = ''; 	// A '+' or ''?
}

// Used to initiate players, returns a player 'object'
exports.createPlayer = function(username, discId){
	return new Player(username, discId);
}

exports.getGameModes = function(){
	return gameModes;
}

exports.getOtherRatings = function(){
	return otherRatings;
}


// Returns highest mmr player object from team
exports.getHighestMMR = function(team){ // TODO add for which game
	var highestMMR = -1;
	var index = -1;
	for(var i = 0; i < team.size(); i++){
		if(team[i].mmr > highestMMR){
			highestMMR = team[i].mmr;
			index = i;
		}
	}
	return team[index];
}

// Return a player with given id from the array
exports.getPlayer = function(array, uid){
	var correctPlayer = '';
	array.forEach(function(player){
		if(player.uid === uid){
			correctPlayer = player;
		}
	});
	return correctPlayer;
}

// TODO Add sort on DESC Game
exports.getSortedRating = function(players, game){
	var s = '';
	if(game === 'trivia'){
		for(var i = 0; i < players.size(); i++){
			s += players[i].userName + ': Trivia Rating: ' + players[i].game + '\n'; // trivia
		}
	}
	return s;
}