'use strict';
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data

	TODO Feature: 
		Add dynamic storage of mmr for support of more games, potential of aim map skill 2v2
*/
const gameModes = ['cs','dota', 'cs1v1', 'dota1v1', 'trivia'];
const startMMR = 2500;

function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = startMMR; 
	// TODO Store array of mmr instead, fetchable by game or something
	/*
	this.mmrs = new Map();
	this.mmrStruct = function(startMmr){
		this.mmr = startMmr;
		this.prevMMR = startMmr; 		// MMR at previous instance
		this.latestUpdate = 0;			// How much mmr was changed
		this.latestUpdatePrefix = ''; 	// A '+' or ''?
	}
	for(var i = 0; i < gameModes.length; i++){
		this.mmrs.set(gameModes[i], mmrStruct(startMMR));
	}
	this.mmrs.set('trivia', mmrStruct(0));

	this.setMMR = function(game, value){
		var struct = this.mmrs.get(game);
		struct.prevMMR = struct.mmr; // Keeps track of last recorded mmr
		struct.mmr = value;
	}

	this.setMMRChange = function(game, value){
		var struct = this.mmrs.get(game);
		struct.latestUpdate = value;
	}

	this.setPlusMinus = function(game, value){
		var struct = this.mmrs.get(game);
		struct.latestUpdatePrefix = value;
	}
	*/
	this.mmr = this.defaultMMR; 	// MMR is updated when all players are fetched
	this.prevMMR = this.defaultMMR; // MMR at previous instance
	this.latestUpdate = 0;			// How much mmr was changed
	this.latestUpdatePrefix = ''; 	// A '+' or ''?

	this.setMMR = function(value){
		this.prevMMR = this.mmr; // Keeps track of last recorded mmr
		this.mmr = value;
	}

	this.setMMRChange = function(value){
		this.latestUpdate = value;
	}

	this.setPlusMinus = function(value){
		this.latestUpdatePrefix = value;
	}
}

// Used to initiate players, returns a player 'object'
exports.createPlayer = function(username, discId){
	return new Player(username, discId);
}

exports.getGameModes = function(){
	return gameModes;
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