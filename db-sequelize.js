'use strict';
// Author: Petter Andersson

var Sequelize = require('sequelize');
var sequelize = {};
var Users = {};

/*
	This file handles database communication using sequelize
	The database is a mysql database, running at KTH servers

	TODO 
	Feature: 
		Add method for returning top 3 MMR holders
		Adjust getTable method to only get users with uid in uids (received error when attempted)

	Bug
		(Potential) Unsure if dbpw is remembered between usage from balance.js and mmr.js (only initialized in balance.js) 
*/

exports.initializePlayers = function(players, dbpw, callback){
	// Init mmr for players
	db_sequelize.initDb(dbpw);
	// Currently fetches entire database, instead of specific users
	db_sequelize.getTable(function(data){
		addMissingUsers(players, data, function(){ // players are updated from within method
			callback(players, data);
		}); 
	});
}

// Adds missing users to database 
// Updates players mmr entry correctly
function addMissingUsers(players, data){
	//console.log('DEBUG: @addMissingUsers, Insert the mmr from data: ', players);
	for(var i = 0; i < players.size(); i++){
		// Check database for this data
		var existingMMR = -1;
		data.forEach(function(oneData){
			if(players[i].uid === oneData.uid){
				existingMMR = oneData.mmr;
			}
		});
		if(existingMMR === -1){ // Make new entry in database since entry doesn't exist
			db_sequelize.createUser(players[i].uid, players[i].userName, players[i].defaultMMR);
			players[i].setMMR(players[i].defaultMMR);
		} else{ // Update players[i] mmr to the correct value
			players[i].setMMR(existingMMR);
		}
	}
}

// Initializes sequelize variables for further usage
exports.initDb = function(dbpw){
	sequelize = new Sequelize('pettea', 'pettea_admin', dbpw, {
		host: 'mysql-vt2016.csc.kth.se',
		dialect: 'mysql',
		operatorsAliases: false
	});

	/* 		
		db: The databse in sql code (For reference)
			Table: 'users': 
			uid VARCHAR(64) NOT NULL, PRIMARY KEY (uid)
			userName VARCHAR(64), 
			mmr int, 
			gamesPlayed int

		users(
			uid VARCHAR(64) NOT NULL, PRIMARY KEY (uid)
			userName VARCHAR(64), 
			cs int,
			cs1v1 int,
			dota int,
			dota1v1 int,
			gamesPlayed int,
	*/

	Users = sequelize.define('users', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
		gamesPlayed: Sequelize.INTEGER
	}, {
		timestamps: false
	}); 

	/*
	Users = sequelize.define('users', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		cs: Sequelize.INTEGER,
		cs1v1: Sequelize.INTEGER,
		dota: Sequelize.INTEGER,
		dota1v1: Sequelize.INTEGER,
		gamesPlayed: Sequelize.INTEGER
	}, {
		timestamps: false
	}); 
	*/
}

// Returns table of users
exports.getTable = function(callback){
	Users.findAll({})
	.then(function(result) {
		callback(result);
	})
}; 

// Gets Top 5 users ordered by mmr
// TODO on more mmr: update mmr to a default value or input (callback, mmr = 'cs') example
exports.getHighScore = function(callback){
	Users.findAll({
		limit: 5,
		order: [
			['mmr', 'DESC'],
			['gamesPlayed', 'DESC'],
			['userName', 'ASC']
		]
	})
	.then(function(result) {
		callback(result);
	})
}; 

// Gets personal stats for user
exports.getPersonalStats = function(uid, callback){
	Users.findAll({
		where: {
			uid: uid
		}
	})
	.then(function(result) {
		callback(result);
	})
}; 

// Used to update a player in database, increasing matches and changing mmr
// TODO on more mmr: Requires which to update: mmr -> cs, cs1v1, dota, dota1v1 (, mmrType = mmr) ?
exports.updateMMR = function(uid, newMmr){
	Users.findById(uid).then(function(user) {
		user
		.update({
			mmr: newMmr,
			gamesPlayed: sequelize.literal('gamesPlayed +1')
	    }).then(function(){
			//console.log('User (id =', uid + ') new mmr set to ' + newMmr)
		})
	});
}

// Add a user to database
// TODO on more mmr: cs: mmr, cs1v1: mmr, dota: mmr, dota1v1: mmr
exports.createUser = function(uid, userName, mmr){
	console.log('DEBUG: @createUser', );
	Users.create({ uid: uid, userName: userName, mmr: mmr, gamesPlayed: 0})
	.then(function(result){
		console.log(result.get({plain:true}))
	});
}