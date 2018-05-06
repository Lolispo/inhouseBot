'use strict';
/*
	Class handles player objects which take care of player data

	TODO: 
		Add dynamic storage of mmr for support of more games, potential of aim map skill 2v2
*/
function Player(username, discId){
	this.userName = username;
	this.uid = discId;
	this.defaultMMR = 2500; 
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
