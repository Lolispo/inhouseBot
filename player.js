'use strict';
// Author: Petter Andersson
/*
	Class handles player objects which take care of player data

	TODO Feature: 
		Add dynamic storage of mmr for support of more games, potential of aim map skill 2v2
*/
const startMMR = 2500;

function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = startMMR; 
	// TODO Store array of mmr instead, fetchable by game or something
	this.mmr = this.defaultMMR; // MMR is updated when all players are fetched
	this.prevMMR = this.defaultMMR;
	this.latestUpdate = 0;
	this.latestUpdatePrefix = '';

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
			s += players[i].username + ': Trivia Rating: ' + players[i].game + '\n'; // trivia
		}
	}
	return s;
}