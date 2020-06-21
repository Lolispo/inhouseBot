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
			uid: { 
				type: Sequelize.STRING, 
				primaryKey: true,
				references: {
					model: 'users',
					key: 'uid',
				}
			},
			gameName: {type: Sequelize.STRING, primaryKey: true},
			userName: Sequelize.STRING,
			mmr: Sequelize.INTEGER,
			gamesPlayed: Sequelize.INTEGER,
			wins: Sequelize.INTEGER
		}, {
			associate: (models) => {
				models.Users.hasMany(this.Ratings, { onDelete: 'cascade' });
			},
			timestamps: false
		});

		// User.hasMany(Ratings, { foreignKey: 'uid' }); // TODO: Fix Foreign key of Rating to user
		// console.log('@DatabaseSequelize.constructor', this.Users, this.Ratings);

		this.Matches = this.sequelize.define('matches', {
			mid: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
			gameName: Sequelize.STRING,
			result: Sequelize.INTEGER,
			team1Name: Sequelize.STRING,
			team2Name: Sequelize.STRING,
		});
	
		this.PlayerMatches = this.sequelize.define('playerMatches', {
			mid: { 
				type: Sequelize.INTEGER, 
				primaryKey: true,
				references: {
					model: 'matches',
					key: 'mid',
				}
			},
			uid: { 
				type: Sequelize.STRING, 
				primaryKey: true,
				references: {
					model: 'users',
					key: 'uid',
				}
			},
			team: Sequelize.INTEGER,
			mmrChange: Sequelize.INTEGER
		}, {
			timestamps: false
		});
	}
}

// Initializes sequelize variables for further usage
const initDb = (database, user, dbpw, hostAddress, dialectDB) => {
	return new DatabaseSequelize(database, user, dbpw, hostAddress, dialectDB);
}

	

// Sync tables after update
const syncTables = () => {
	DatabaseSequelize.instance.Ratings.sync({ alter: true });
	DatabaseSequelize.instance.Users.sync({ alter: true });
	DatabaseSequelize.instance.Matches.sync({ alter: true });
	DatabaseSequelize.instance.PlayerMatches.sync({ alter: true });
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
	const adjustedPlayers = await Promise.all(players.map(async (player) => {
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

			// Load Steam ID
			if (existingUser.steamid) {
				player.setSteamId(existingUser.steamid);
			}
		}
		return player;
	}));
	callback(adjustedPlayers);
}

const storeSteamIdDb = (uid, steamid) => {
	return DatabaseSequelize.instance.Users.update(
		{ steamid: steamid },
		{ where: { uid: uid } }
	)
}

// Returns table of all users
const getAllUsers = async () => {
	const result = await DatabaseSequelize.instance.Users.findAll({})
	return result;
};

const getUser = async (uid) => {
	return DatabaseSequelize.instance.Users.findAll({
		where: {
			uid: {
				[Sequelize.Op.eq]: uid
			}
		}
	})
}

const getUsersUids = async (uidList) => {
	return DatabaseSequelize.instance.Users.findAll({
		where: {
			uid: {
				[Sequelize.Op.in]: uidList
			}
		}
	})
}

// Method to only get users with uid in uids (received error when attempted) instead of every user
const getUsers = async (listOfUsers) => {
	const uidList = listOfUsers.map(user => user.uid);
	return getUsersUids(uidList);
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
				/*{ // TODO: RankReset
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
		/*
		await DatabaseSequelize.instance.Ratings.destroy({
			where: {
				uid
			}
		})*/ 
		// On delete cascade should remove Ratings aswell
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

// Used to createMatch
// Note: Requires players in database
const createMatch = async (result, balanceInfo, mmrChange) => {
	// console.log('@createMatch - input:', result, balanceInfo);
	// Prepare insertions
	const { game, team1, team2, team1Name, team2Name } = balanceInfo;
	const transaction = await DatabaseSequelize.instance.sequelize.transaction();
	// Do insertions
	const resultDB = await DatabaseSequelize.instance.Matches.create({
		gameName: game,
		result: result,
		team1Name: team1Name,
		team2Name: team2Name
	})
	console.log('Res:', resultDB);
	const mid = resultDB.dataValues.mid;
	team1.forEach(async (player) => {
		console.log('Player: (Team1)', player);
		await DatabaseSequelize.instance.PlayerMatches.create({
			mid: mid,
			uid: player.uid,
			team: 1,
			mmrChange: mmrChange.t1
		})
	})
	team2.forEach(async (player) => {
		console.log('Player: (Team2)', player);
		await DatabaseSequelize.instance.PlayerMatches.create({
			mid: mid,
			uid: player.uid,
			team: 2,
			mmrChange: mmrChange.t2
		})
	})
	transaction.commit();
	return resultDB;
}

// Get Winrate playing with other players
const bestTeammates = async (uid, game) => {
	// Fetch all games you have played
	// TODO: Create views to help query speeds
	// Use joins?
	// Use mmrChange field on playerMatches
	const matchQuery = 'SELECT * FROM matches WHERE mid IN (SELECT mid FROM playerMatches WHERE uid = ?) AND gameName = ?;'
	const matches = await DatabaseSequelize.instance.sequelize.query(matchQuery, 
	{ 
		replacements: [uid, game],
		type: Sequelize.QueryTypes.SELECT 
	});
	console.log('@bestTeammates: matches:', matches.dataValues);
	const mids = matches.dataValues.map(entry => entry.mid);
	const playersSameMatchQuery = 'SELECT * FROM playerMatches WHERE mid IN (?);';
	const playersSameMatch = await DatabaseSequelize.instance.sequelize.query(playersSameMatchQuery, 
	{ 
		replacements: [mids],
		type: Sequelize.QueryTypes.SELECT 
	});
	console.log('@bestTeammates: players same match:', playersSameMatch.dataValues);
	const map = {}; // track of winrates
	matches.dataValues.forEach(async (match) => {
		const playerTeamQuery = 'SELECT team FROM playerMatches WHERE mid = ? AND uid = ?;'
		const playerTeam = await DatabaseSequelize.instance.sequelize.query(playerTeamQuery, 
		{ 
			replacements: [match.mid, uid],
			type: Sequelize.QueryTypes.SELECT 
		});
		const team = playerTeam.dataValues.team;
		const teammateQuery = 'SELECT uid FROM playerMatches WHERE mid = ? AND uid != ? AND team = ?';
		const teammates = await DatabaseSequelize.instance.sequelize.query(teammateQuery, 
		{ 
			replacements: [match.mid, uid, team],
			type: Sequelize.QueryTypes.SELECT 
		});
		teammates.dataValues.map(teammate => teammate.uid).forEach((teammateUid) => {
			if(!map[teammateUid]) {
				map[teammateUid] = {
					wins: 0,
					losses: 0,
					ties: 0,
					totalMatches: 0,
				}
			}
			const matchResult = match.result;
			if ((matchResult === 1 && team === 1) || (matchResult === 2 && team === 2)) {
				// Win
			} else if ((matchResult === 1 && team === 2) || (matchResult === 2 && team === 1)) {
				// Loss
				
			} else { // Tie

			}
			// Update map[teammateUid] with results
		});
	})
}

// TODO: Returns last played game
const lastGame = async (game = null) => {
	return null;
}

module.exports = {
	initializePlayers : initializePlayers,
	initializeDBSequelize : initializeDBSequelize,
	initDb : initDb,
	getUser : getUser,
	getUsers : getUsers,
	getUsersUids : getUsersUids,
	// getAllUsers : getAllUsers,
	getHighScore : getHighScore,
	getPersonalStats : getPersonalStats,
	updateDbMMR : updateDbMMR,
	createUser : createUser,
	createRatingForUser : createRatingForUser,
	createMatch : createMatch,
	storeSteamIdDb : storeSteamIdDb
}