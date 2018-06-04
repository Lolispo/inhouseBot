'use strict';
// Author: Petter Andersson

var Sequelize = require('sequelize');
var sequelize = {};
var Users = {};
var player_js = require('./player')

/*
	This file handles database communication using sequelize
	The database is a mysql database, running at KTH servers
*/

var initializePlayers = function(players, dbpw, callback){
	// Init mmr for players
	initDb(dbpw);
	// Currently fetches entire database, instead of specific users
	getTable(function(data){
		addMissingUsers(players, data, function(playerList){ // players are updated from within method
			callback(playerList);
		}); 
	});
}

// Adds missing users to database 
// Updates players mmr entry correctly
function addMissingUsers(players, data, callback){
	//console.log('DEBUG: @addMissingUsers, Insert the mmr from data: ', players);
	var gameModes = player_js.getGameModes();
	var otherRatings = player_js.getOtherRatings();
	for(var i = 0; i < players.size(); i++){
		// Check database for this data
		var existingUser = -1;
		data.forEach(function(oneData){ 
			if(players[i].uid === oneData.uid){ // TODO: Redo so you skip unecessary loops
				existingUser = oneData;
			}
		});
		if(existingUser === -1){ // Make new entry in database since entry doesn't exist
			db_sequelize.createUser(players[i].uid, players[i].userName, players[i].defaultMMR);
		} else{ // Update players[i] mmr to the correct value
			for(var j = 0; j < gameModes.length; j++){
				players[i].setMMR(gameModes[j], existingUser.dataValues[gameModes[j]]);
			}
			console.log('DEBUG @addMissingUsers outside', otherRatings);
			for(var j = 0; j < otherRatings.length; j++){
				console.log('DEBUG: @addMissingUsers', otherRatings[j]);
				players[i].setMMR(otherRatings[j], existingUser.dataValues[otherRatings[j]]);
			}
		}
	}
	callback(players);
}

// Initializes sequelize variables for further usage
var initDb = function(dbpw){
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
			cs int,
			cs1v1 int,
			dota int,
			dota1v1 int,
			trivia int,
			mmr int, 
			gamesPlayed int,
	*/
	Users = sequelize.define('users', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		cs: Sequelize.INTEGER,
		cs1v1: Sequelize.INTEGER,
		dota: Sequelize.INTEGER,
		dota1v1: Sequelize.INTEGER,
		trivia: Sequelize.INTEGER,
		mmr: Sequelize.INTEGER, // Remove me in due time
		gamesPlayed: Sequelize.INTEGER
	}, {
		timestamps: false
	}); 
/*
	CREATE TABLE ratings(
		uid VARCHAR(64) NOT NULL,
		gameName VARCHAR(64) NOT NULL,
		userName VARCHAR(64),
		mmr int,
		gamesPlayed int,
		wins int,
		losses int,  
		PRIMARY KEY (uid, gameName),
		FOREIGN KEY (uid) REFERENCES users(uid),
		FOREIGN KEY (gameName) REFERENCES game(gameName),
		FOREIGN KEY (userName) REFERENCES users(userName)
	);

	Ratings = sequelize.define('ratings', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		gameName: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
		gamesPlayed: Sequelize.INTEGER,
		wins: Sequelize.INTEGER,
		losses: Sequelize.INTEGER,
	}, {
		timestamps: false
	}); 
*/
}

// Returns table of users
// TODO: Adjust method to only get users with uid in uids (received error when attempted) instead of every user
var getTable = function(callback){
	Users.findAll({})
	.then(function(result) {
		callback(result);
	})
}; 

// Gets Top 5 users ordered by mmr
var getHighScore = function(game, callback){
	Users.findAll({ // TODO: RefactorDB Where gameName = game
		limit: 5,
		order: [
			[game, 'DESC'],
			['gamesPlayed', 'DESC'],
			['userName', 'ASC']
		]
	})
	.then(function(result) {
		callback(result);
	})
}; 

// Gets personal stats for user
var getPersonalStats = function(uid, game, callback){
	Users.findAll({
		where: {
			uid: uid
		}
	})
	.then(function(result) {
		callback(result, game);
	})
}; 

// Used to update a player in database, increasing matches and changing mmr
// TODO	Find a better way to choose column from variable, instead of hard code
//  	mmr -> [game] or something
var updateMMR = function(uid, newMmr, game){
	Users.findById(uid).then(function(user) {
		switch(game){ 
			case 'dota':
				user.update({
					dota: newMmr,
					gamesPlayed: sequelize.literal('gamesPlayed +1')
			    })
				break;
			case 'dota1v1':
				user.update({
					dota1v1: newMmr,
					gamesPlayed: sequelize.literal('gamesPlayed +1')
			    })
				break;
			case 'cs1v1':
				user.update({
					cs1v1: newMmr,
					gamesPlayed: sequelize.literal('gamesPlayed +1')
			    })
				break;
			case 'trivia':
				user.update({
					trivia: newMmr,
			    })
				break;
			case 'cs':
			default:
				user.update({
					cs: newMmr,
					gamesPlayed: sequelize.literal('gamesPlayed +1')
			    })
				break;
		}
	});
}

// Add a user to database
var createUser = function(uid, userName, mmr){
	console.log('DEBUG: @createUser', );
	Users.create({ uid: uid, userName: userName, cs: mmr, dota: mmr, cs1v1: mmr, dota1v1: mmr, trivia: 0, gamesPlayed: 0})
	.then(function(result){
		console.log(result.get({plain:true}))
	});
}

module.exports = {
	initializePlayers : initializePlayers,
	initDb : initDb,
	getTable : getTable,
	getHighScore : getHighScore,
	getPersonalStats : getPersonalStats,
	updateMMR : updateMMR,
	createUser : createUser
}