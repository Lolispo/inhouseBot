'use strict';
// Author: Petter Andersson

const player_js = require('./player')
const f = require('./f')

const Sequelize = require('sequelize');
var sequelize = {};
var Users = {};


/*
	This file handles database communication using sequelize
	The database is a mysql database, running at KTH servers
*/

var initializePlayers = function(players, callback){
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
	var allGameModes = player_js.getAllModes();
	for(var i = 0; i < players.length; i++){
		// Check database for this data
		var existingUser = data.find(function(oneData){ 
			return players[i].uid === oneData.uid;
		});
		if(f.isUndefined(existingUser)){ // Make new entry in database since entry doesn't exist
			createUser(players[i].uid, players[i].userName, players[i].defaultMMR);
		} else{ // Update players[i] mmr to the correct value
			for(var j = 0; j < allGameModes.length; j++){ // Initialize all gameMode ratings
				if(!allGameModes[j].includes('_temp')){ // Don't try to load temp ratings from Database
					//console.log('Setting ' + allGameModes[j] + ' rating to ' + existingUser.dataValues[allGameModes[j]]);
					players[i].setMMR(allGameModes[j], existingUser.dataValues[allGameModes[j]]);				
				}
			}
		}
	}
	callback(players);
}

// Initializes sequelize variables for further usage
var initDb = function(database, user, dbpw, hostAddress, dialectDB){
	sequelize = new Sequelize(database, user, dbpw, {
		host: hostAddress,
		dialect: dialectDB,
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

	/**
	 * CREATE TABLE matches (
	 *  mid VARCHAR(64) NOT NULL AUTO INCREMENT, PRIMARY KEY (mid)
			game VARCHAR(64),
			date DATE, 


		CREATE TABLE match_players (
			mid VARCHAR(64),
			uid VARCHAR(64),
			winner BOOLEAN, 
			FOREIGN KEY (mid) REFERENCES matches,
			FOREIGN KEY (uid) REFERENECES users,
		)

	const getBirthdays = async () => {
		const sql = 'SELECT * FROM birthdays WHERE DATE(birthday) = CURDATE();';
		try {
			const result = await pool.query(sql);
			console.log('@getBirthdays Records:', result);
			return result;
		} catch (error) {
			console.error('@getBirthdays Error:', error);
			return error;
		}
	}

	*/
	/*
	Users = sequelize.define('matches', {
		mid: {type: Sequelize.STRING, primaryKey: true},
		game: Sequelize.STRING,
	}, {
		timestamps: false
	});
	*/ 
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
var getHighScore = function(game, size, callback){
	Users.findAll({ // TODO: RefactorDB Where gameName = game
		limit: size,
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
	Users.findByPk(uid).then(function(user) {
		switch(game){ 
			case 'dota':
				user.update({
					dota: newMmr,
			    })
				break;
			case 'dota1v1':
				user.update({
					dota1v1: newMmr,
			    })
				break;
			case 'cs1v1':
				user.update({
					cs1v1: newMmr,
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