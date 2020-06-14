'use strict';
// Author: Petter Andersson

const player_js = require('../game/player')
const f = require('../tools/f')

const Sequelize = require('sequelize');


/*
	This file handles database communication using sequelize
	The database is a mysql database, running at KTH servers
*/

// TODO: Cache of loaded players

class DatabaseSequelize {
	constructor(database, user, dbpw, hostAddress, dialectDB) {
		this.sequelize = new Sequelize(database, user, dbpw, {
			host: hostAddress,
			dialect: dialectDB,
			operatorsAliases: false
		});

		this.Users = this.sequelize.define('users', {
			uid: {type: Sequelize.STRING, primaryKey: true},
			userName: Sequelize.STRING,
			steamid: Sequelize.STRING,
			cs: Sequelize.INTEGER,
			cs1v1: Sequelize.INTEGER,
			dota: Sequelize.INTEGER,
			dota1v1: Sequelize.INTEGER,
			trivia: Sequelize.INTEGER,
			gamesPlayed: Sequelize.INTEGER
		}, {
			timestamps: false
		});
	
		this.Ratings = this.sequelize.define('ratings', {
			uid: { type: Sequelize.STRING, primaryKey: true },
			gameName: {type: Sequelize.STRING, primaryKey: true},
			userName: Sequelize.STRING,
			mmr: Sequelize.INTEGER,
			gamesPlayed: Sequelize.INTEGER,
			wins: Sequelize.INTEGER
		}, {
			timestamps: false
		});
		// console.log('@DatabaseSequelize.constructor', this.Users, this.Ratings);
	}
}

// Initializes sequelize variables for further usage
const initDb = (database, user, dbpw, hostAddress, dialectDB) => {
	return new DatabaseSequelize(database, user, dbpw, hostAddress, dialectDB);
}

	// User.hasMany(Ratings, { foreignKey: 'uid' }); // TODO: Fix Foreign key of Rating to user

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

	
	Matches = DatabaseSequelize.instance.sequelize.define('matches', {
		mid: {type: Sequelize.STRING, primaryKey: true},
		game: Sequelize.STRING,
	});
	*/

// Sync tables after update
const syncTables = () => {
	DatabaseSequelize.instance.Ratings.sync({ alter: true });
	DatabaseSequelize.instance.Users.sync({ alter: true });
}

const initializeDBSequelize = (config) => {
	const dbconn = initDb(config.name, config.user, config.password, config.host, config.dialect);
	DatabaseSequelize.instance = dbconn;
	// syncTables(); // Run this when updating database structure
	return dbconn;
}

const initializePlayers = async (players, game, callback) => {
	const specificUsers = await getUsers(players); // Specific users
	addMissingUsers(players, specificUsers, game, (playerList) => { // players are updated from within method
		callback(playerList);
	}); 
}

// Adds missing users to database 
// Updates players mmr entry correctly
const addMissingUsers = async (players, specificUsers, game, callback) => {
	//console.log('DEBUG: @addMissingUsers, Insert the mmr from data: ', players);
	// var allGameModes = player_js.getAllModes();
	players = await Promise.all(players.map(async (player) => {
		const existingUser = specificUsers.find((oneData) => { 
			return player.uid === oneData.uid;
		});
		if(f.isUndefined(existingUser)){ // Make new entry in database since entry doesn't exist
			createUserWithGame(player.uid, player.userName, player.defaultMMR, game);
		} else { // Update local player mmr to the correct value
			const userRating = await getRatingUser(player.uid, game);
			// console.log('UserRating:', player.userName, game, userRating);
			if (userRating.length === 0) { // Check if Rating entry exist for user
				createRatingForUser(player.uid, player.userName, player.defaultMMR, game);
			} else {
				console.log('Set (local) mmr:', player.userName, game, userRating[0].dataValues.mmr);
				player.setMMR(game, userRating[0].dataValues.mmr);
			}
			/*
			for(var j = 0; j < allGameModes.length; j++){ // Initialize all gameMode ratings
				if(!allGameModes[j].includes('_temp')){ // Don't try to load temp ratings from Database
					//console.log('Setting ' + allGameModes[j] + ' rating to ' + existingUser.dataValues[allGameModes[j]]);
					player.setMMR(allGameModes[j], existingUser.dataValues[allGameModes[j]]);				
				}
			}*/
		}
		return player;
	}));
	callback(players);
	/*
	for(var i = 0; i < players.length; i++){
		// Check database for this data
		var existingUser = data.find(function(oneData){ 
			return players[i].uid === oneData.uid;
		});
		if(f.isUndefined(existingUser)){ // Make new entry in database since entry doesn't exist
			createUser(players[i].uid, players[i].userName, players[i].defaultMMR);
			createRatingForUser(players[i].uid, players[i].userName, players[i].defaultMMR, game);
		} else{ // Update players[i] mmr to the correct value
			for(var j = 0; j < allGameModes.length; j++){ // Initialize all gameMode ratings
				if(!allGameModes[j].includes('_temp')){ // Don't try to load temp ratings from Database
					//console.log('Setting ' + allGameModes[j] + ' rating to ' + existingUser.dataValues[allGameModes[j]]);
					players[i].setMMR(allGameModes[j], existingUser.dataValues[allGameModes[j]]);				
				}
			}
		}
	}*/
}

// Returns table of users
const getAllUsers = async () => {
	const result = await DatabaseSequelize.instance.Users.findAll({})
	return result;
}; 

// Method to only get users with uid in uids (received error when attempted) instead of every user
const getUsers = async (listOfUsers) => {
	const users = await DatabaseSequelize.instance.Users.findAll({
		where: {
			uid: {
				[Sequelize.Op.in]: listOfUsers.map(user => user.uid)
			}
		}
	})
	return users;
}

// Gets Top 5 users ordered by mmr
const getHighScore = async (game, size) => {
	const result = await DatabaseSequelize.instance.Ratings.findAll({
		limit: size,
		order: [
			['mmr', 'DESC'],
			['gamesPlayed', 'DESC'],
			['userName', 'ASC']
		],
		where: {
			[Sequelize.Op.and]: [
				/*{
					gamesPlayed: {
						[Sequelize.Op.gt]: 0
					}
				},*/
				{
					gameName: game
				}
			]
			/*
			[Sequelize.Op.or]: [
				{
					gamesPlayed: {
						[Sequelize.Op.gt]: 0
					}
				}, {
					[game]: {
						[Sequelize.Op.ne]: 2500 
					}, 
				}
			]	*/
		}
	})
	return result;
}; 

// Gets personal stats for user
var getPersonalStats = async (uid) => {
	const result = await DatabaseSequelize.instance.Ratings.findAll({
		where: {
			uid: uid,
			/*
			gamesPlayed: {
				[Sequelize.Op.gt]: 0
			}*/
		}
	})
	return result;
}; 

// Used to update a player in database, increasing matches and changing mmr
// TODO	Find a better way to choose column from variable, instead of hard code
//  	mmr -> [game] or something
const updateDbMMR = async (uid, newMmr, game, won) => {
	const rating = await DatabaseSequelize.instance.Ratings.findOne({
		where: {
			uid,
			gameName: game
		}
	});
	if (rating) {
		const result = await rating.update({
				mmr: newMmr,
				gamesPlayed: DatabaseSequelize.instance.sequelize.literal('gamesPlayed +1'),
				...(won && { wins: DatabaseSequelize.instance.sequelize.literal('wins +1') }),
			}
		)
		return result;
	}
}

// Create user and ratings entry in transaction
const createUserWithGame = async () => {
	let transaction;    
	try {
		transaction = await DatabaseSequelize.instance.sequelize.transaction();
		await createUser(player.uid, player.userName, player.defaultMMR);
		await createRatingForUser(player.uid, player.userName, player.defaultMMR, game);
		await transaction.commit();
	} catch (err) {
		// Rollback transaction only if the transaction object is defined
		if (transaction) await transaction.rollback();
		return false;
	}
	return true;
}

// Add a user to database
const createUser = async (uid, userName, mmr) => {
	const result = await DatabaseSequelize.instance.Users.create({ 
		uid: uid, 
		userName: 
		userName, 
		cs: mmr, 
		dota: mmr, 
		cs1v1: mmr, 
		dota1v1: mmr, 
		trivia: 0, 
		gamesPlayed: 0
	})
	console.log('@createUser:', userName, result.get({ plain: true }))
	return result;
}

const createRatingForUser = async (uid, userName, mmr, game, gamesPlayed = 0) => {
	const result = await DatabaseSequelize.instance.Ratings.create({
		uid: uid,
		userName: userName,
		gameName: game,
		mmr: mmr,
		gamesPlayed: gamesPlayed,
		wins: 0,
		losses: 0,
	})
	console.log('@createRatingForUser:', userName, game, result.get({ plain: true }));
	return result;
}

const getRatingUser = async (uid, game) => {
	return DatabaseSequelize.instance.Ratings.findAll({
		where: {
			uid: uid,
			gameName: game
		}
	})
}

const removeUser = async (uid) => {
	let transaction;    
	try {
		transaction = await DatabaseSequelize.instance.sequelize.transaction();
		await DatabaseSequelize.instance.Ratings.destroy({ // use foreign keys todo
			where: {
				uid
			}
		})
		await DatabaseSequelize.instance.Users.destroy({
			where: {
				uid
			}
		})

		await transaction.commit();
	} catch (err) {
		// Rollback transaction only if the transaction object is defined
		if (transaction) await transaction.rollback();
		return false;
	}
	return true;
}

module.exports = {
	initializePlayers : initializePlayers,
	initializeDBSequelize : initializeDBSequelize,
	initDb : initDb,
	getAllUsers : getAllUsers,
	getHighScore : getHighScore,
	getPersonalStats : getPersonalStats,
	updateDbMMR : updateDbMMR,
	createUser : createUser,
	createRatingForUser : createRatingForUser
}