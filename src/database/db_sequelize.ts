'use strict';
// Author: Petter Andersson

import * as f from '../tools/f';
import * as Sequelize from 'sequelize';

/*
	This file handles database communication using sequelize
	The database is a mysql database, running at KTH servers
*/

// TODO: Cache of loaded players
export class DatabaseSequelize {
	sequelize;
	static instance;

	static setGlobalInstance(value) {
		this.instance = value;
	}

	Users;
	Ratings;
	Matches;
	PlayerMatches;
	CSPlayerStats;
	
	constructor(database, user, dbpw, hostAddress, dialectDB) {
		this.sequelize = new Sequelize.Sequelize(database, user, dbpw, {
			host: hostAddress,
			dialect: dialectDB
		});

		this.Users = this.sequelize.define('users', {
			uid: { type: Sequelize.STRING, primaryKey: true },
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
			gameName: { type: Sequelize.STRING, primaryKey: true },
			userName: Sequelize.STRING,
			mmr: Sequelize.INTEGER,
			gamesPlayed: Sequelize.INTEGER,
			wins: Sequelize.INTEGER,
			// highestRating: 
			// lowestRating: 
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
			mapName: Sequelize.STRING,
			score: Sequelize.STRING,
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

	/*
	{ 
		name: 'Morgan',

		roundsplayed: '40',
		damage: '4339',
		firstkill_t: '6',
		kills: '37',
		headshot_kills: '10',
		'3kill_rounds': '2',
		assists: '11',
		'2kill_rounds': '9',
		deaths: '24',
		'1kill_rounds': '13',
		firstdeath_t: '3',
		flashbang_assists: '1',
		tradekill: '2',
		bomb_plants: '2',
		bomb_defuses: '1',
		firstkill_ct: '6',
		firstdeath_ct: '3',
		
		uid: '2' 
		v2: '1',
		v1: '1',
	}
	*/

		this.CSPlayerStats = this.sequelize.define('CSPlayerStats', {
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
			name: Sequelize.STRING,
			// TODO: Make them as ints
			/*
       uid: playerDisc.uid,
          name: player.name,
          roundsplayed: parseInt(player.roundsplayed || 0),
          kills: parseInt(player.kills || 0),
          deaths: parseInt(player.deaths || 0),
          assists: parseInt(player.assists || 0),
          damage: parseInt(player.damage || 0),
          headshot_kills: parseInt(player.headshot_kills || 0),
          '1kill_rounds': parseInt(player['1kill_rounds'] || 0),
          '2kill_rounds': parseInt(player['2kill_rounds'] || 0),
          '3kill_rounds': parseInt(player['3kill_rounds'] || 0),
          '4kill_rounds': parseInt(player['4kill_rounds'] || 0),
          '5kill_rounds': parseInt(player['5kill_rounds'] || 0),
          tradekill: parseInt(player.tradekill || 0),
          firstkill_ct: parseInt(player.firstkill_ct || 0),
          firstdeath_ct: parseInt(player.firstdeath_ct || 0),
          firstkill_t: parseInt(player.tradekill || 0),
          firstdeath_t: parseInt(player.tradekill || 0),
          bomb_plants: parseInt(player.bomb_plants || 0),
          bomb_defuses: parseInt(player.bomb_defuses || 0),
          flashbang_assists: parseInt(player.flashbang_assists || 0),
			*/
			roundsplayed: Sequelize.INTEGER,
			kills: Sequelize.INTEGER,
			deaths: Sequelize.INTEGER,
			assists: Sequelize.INTEGER,
			damage: Sequelize.INTEGER,
			headshot_kills: Sequelize.INTEGER,
			'1kill_rounds': Sequelize.INTEGER,
			'2kill_rounds': Sequelize.INTEGER,
			'3kill_rounds': Sequelize.INTEGER,
			'4kill_rounds': Sequelize.INTEGER,
			'5kill_rounds': Sequelize.INTEGER,
			tradekill: Sequelize.INTEGER,
			firstkill_t: Sequelize.INTEGER,
			firstdeath_t: Sequelize.INTEGER,
			firstkill_ct: Sequelize.INTEGER,
			firstdeath_ct: Sequelize.INTEGER,
			bomb_plants: Sequelize.INTEGER,
			bomb_defuses: Sequelize.INTEGER,
			flashbang_assists: Sequelize.INTEGER,
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
	DatabaseSequelize.instance.CSPlayerStats.sync({ alter: true });
}

export const initializeDBSequelize = (config) => {
	const dbconn = initDb(config.name, config.user, config.password, config.host, config.dialect);
	DatabaseSequelize.setGlobalInstance(dbconn);
	// syncTables(); // Run this when updating database structure
	return dbconn;
}

export const initializePlayers = async (players, game, callback) => {
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
		if (f.isUndefined(existingUser)){ // Make new entry in database since entry doesn't exist
			const createRes = createUserWithGame(player.uid, player.userName, player.defaultMMR, game);
			console.log('@addMissingUsers: Created New Users:', createRes);
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

export const storeSteamIdDb = (uid, steamid) => {
	return DatabaseSequelize.instance.Users.update(
		{ steamid: steamid },
		{ where: { uid: uid } }
	)
}

// Returns table of all users
export const getAllUsers = async () => {
	const result = await DatabaseSequelize.instance.Users.findAll({})
	return result;
};

export const getUser = async (uid) => {
	return DatabaseSequelize.instance.Users.findAll({
		where: {
			uid: {
				[Sequelize.Op.eq]: uid
			}
		}
	})
}

export const getUsersUids = async (uidList) => {
	return DatabaseSequelize.instance.Users.findAll({
		where: {
			uid: {
				[Sequelize.Op.in]: uidList
			}
		}
	})
}

// Method to only get users with uid in uids (received error when attempted) instead of every user
export const getUsers = async (listOfUsers) => {
	const uidList = listOfUsers.map(user => user.uid);
	return getUsersUids(uidList);
}

// Gets Top 5 users ordered by mmr
// 
/*
Latest: 
SELECT COUNT(*) FROM playerMatches WHERE mmrChange IN (
	SELECT playerMatches.mid, uid, mmrChange, gameName FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid 
	WHERE uid = "96293765001519104" AND gameName = "dota" ORDER BY playerMatches.mid DESC
	)

+-----+-------------------+-----------+----------+
| mid | uid               | mmrChange | gameName |
+-----+-------------------+-----------+----------+
| 112 | 96293765001519104 |       -25 | dota     |
| 111 | 96293765001519104 |       -25 | dota     |
| 110 | 96293765001519104 |       -25 | dota     |
| 105 | 96293765001519104 |       -25 | dota     |
| 104 | 96293765001519104 |        25 | dota     |
| 103 | 96293765001519104 |        25 | dota     |
+-----+-------------------+-----------+----------+

*/
export const getHighScore = async (game, size) => {
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
export const getPersonalStats = async (uid) => {
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
export const updateDbMMR = async (uid, newMmr, game, won = false) => {
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

export const truncateRating = async (uid, newMmr, game) => {
	const rating = await DatabaseSequelize.instance.Ratings.findOne({
		where: {
			uid,
			gameName: game
		}
	});
	if (rating) {
		const result = await rating.update({
				mmr: newMmr
			}
		)
		return result;
	}
}

// Create user and ratings entry in transaction
export const createUserWithGame = async (uid, userName, defaultMMR, game) => {
	let transaction;    
	try {
		transaction = await DatabaseSequelize.instance.sequelize.transaction();
		await createUser(uid, userName, defaultMMR);
		await createRatingForUser(uid, userName, defaultMMR, game);
		await transaction.commit();
	} catch (err) {
		// Rollback transaction only if the transaction object is defined
		if (transaction) await transaction.rollback();
		return false;
	}
	return true;
}

// Add a user to database
export const createUser = async (uid, userName, mmr) => {
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

export const createRatingForUser = async (uid, userName, mmr, game, gamesPlayed = 0) => {
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

export const getRatingUser = async (uid, game) => {
	return DatabaseSequelize.instance.Ratings.findAll({
		where: {
			uid: uid,
			gameName: game
		}
	})
}

export const removeUser = async (uid) => {
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

export const storePlayerResults = async (team, teamIndex, mmrChange, mid, stats) => {
	return team.map(async (player) => {
		// console.log(`Player: (Team ${teamIndex})`, player);
		const resPlayerMatch = await DatabaseSequelize.instance.PlayerMatches.create({
			mid: mid,
			uid: player.uid,
			team: teamIndex,
			mmrChange: mmrChange
		})
		if (stats) {
			const playerStats = stats['team' + teamIndex][player.uid];
			const csRes = await DatabaseSequelize.instance.CSPlayerStats.create({
				...playerStats,
				mid: mid,
				uid: player.uid,
				team: teamIndex,
			});
			return { resPlayerMatch, csRes };
		}
		return { resPlayerMatch }
	})
}

// Used to createMatch
// Note: Requires players in database
export const createMatch = async (result, balanceInfo, mmrChange, map, scoreString, stats) => {
	// TODO: Use stats data
	//  - get cs stats and save them
	//  - match id get

	// console.log('@createMatch - input:', result, balanceInfo);
	// Prepare insertions
	const { game, team1, team2, team1Name, team2Name } = balanceInfo;
	const transaction = await DatabaseSequelize.instance.sequelize.transaction();
	// Do insertions
	const resultDB = await DatabaseSequelize.instance.Matches.create({
		gameName: game,
		result: result,
		team1Name: team1Name,
		team2Name: team2Name,
		...(map && { mapName: map }),
		...(scoreString && { score: scoreString })
	})
	console.log('Res:', map, scoreString, resultDB);
	const mid = resultDB.dataValues.mid;
	await storePlayerResults(team1, 1, mmrChange.t1, mid, stats);
	await storePlayerResults(team2, 2, mmrChange.t2, mid, stats);
	transaction.commit();
	return resultDB;
}

// TODO: Fix rollback match id
export const rollbackMatch = async (mid) => {
	let transaction;    
	try {
		transaction = await DatabaseSequelize.instance.sequelize.transaction();
		
		// Fetch rating changes from match result with given mid
		const playerRatingForGame = await DatabaseSequelize.instance.PlayerMatches.findAll({
			where: {
				mid: {
					[Sequelize.Op.eq]: mid
				}
			}
		});

		console.log('Res:', playerRatingForGame);

		// Revert changes to the players affected
		playerRatingForGame.forEach(async (playerRatingMatchRes) => {
			const { team, mmrChange, uid, mid } = playerRatingMatchRes.dataValues;
			await DatabaseSequelize.instance.Ratings.update(
				{ mmr: DatabaseSequelize.instance.sequelize.literal(`mmr ${(mmrChange.charAt(0) === '-' ? mmrChange.substring(1) : '-' + mmrChange)}`) },
				{ 
					where: { 
						uid: uid,
					}
				}
			)
		});

		// Remove playerMatches with mid
		await DatabaseSequelize.instance.PlayerMatches.destroy({
			where: {
				mid: mid
			}
		})

		// Remove match with mid
		await DatabaseSequelize.instance.Matches.destroy({
			where: {
				mid: mid
			}
		})

		// Finish transaction
		await transaction.commit();
	} catch (err) {
		// Rollback transaction only if the transaction object is defined
		console.log('Error Rollback match', err);
		if (transaction) await transaction.rollback();
		return false;
	}
	return true;
}

// Get Winrate playing with other players
export const bestTeammates = async (uid, game) => {
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
			if (!map[teammateUid]) {
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
export const lastGame = async (uid, game = null) => {
	/*const mid = `SELECT * FROM matches LEFT JOIN playerMatches ON matches.mid = playerMatches.mid WHERE playerMatches.mid = 
	SELECT userName, result, gameName, mapName, score, updatedAt, playerMatches.mid, mmrChange, team1Name, team2Name, team FROM matches LEFT JOIN playerMatches ON matches.mid = playerMatches.mid LEFT JOIN users ON users.uid = playerMatches.uid WHERE playerMatches.mid = (SELECT playerMatches.mid FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid WHERE uid = ? ORDER BY mid DESC LIMIT 1) ORDER BY team;
	SELECT userName, result, gameName, mapName, score, updatedAt, playerMatches.mid, mmrChange, team1Name, team2Name, team FROM matches LEFT JOIN playerMatches ON matches.mid = playerMatches.mid LEFT JOIN users ON users.uid = playerMatches.uid WHERE playerMatches.mid = (SELECT playerMatches.mid FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid WHERE uid = "96293765001519104" ORDER BY mid DESC LIMIT 1) ORDER BY team;
	(SELECT mid FROM playerMatches WHERE uid = ? ORDER BY mid DESC LIMIT 1);`
	;*/
	const where = `WHERE uid = ? ${game ? 'AND gameName = ? ': ''}`;
	const mid = `SELECT playerMatches.mid FROM playerMatches LEFT JOIN matches ON playerMatches.mid = matches.mid ${where}ORDER BY mid DESC LIMIT 1`;
	const lastGame = `SELECT userName, result, gameName, mapName, score, updatedAt, playerMatches.mid, mmrChange, team1Name, team2Name, team FROM matches LEFT JOIN playerMatches ON matches.mid = playerMatches.mid LEFT JOIN users ON users.uid = playerMatches.uid WHERE playerMatches.mid = (${mid}) ORDER BY team;`;
	console.log('@query debug lastgame', lastGame);
	const replacements = game ? [uid, game] : [uid]
	const lastGameQuery = await DatabaseSequelize.instance.sequelize.query(lastGame, 
	{ 
		replacements: replacements,
		type: Sequelize.QueryTypes.SELECT 
	});
	// Game exist
	console.log('@RESULT', lastGameQuery);
	if (lastGameQuery[0]?.result) {
		const gameValue = lastGameQuery[0];
		const result = {
			team1Name: gameValue.team1Name,
			team2Name: gameValue.team2Name,
			updatedAt: gameValue.updatedAt,
			result: gameValue.result,
			gameName: gameValue.gameName,
			...(gameValue.mapName && { mapName: gameValue.mapName }),
			...(gameValue.score && { score: gameValue.score }),
			players: undefined
		}
		const players = {
			team1: [],
			team2: []
		};
		lastGameQuery.map(playerObj => {
			const player = {
				userName: playerObj.userName,
				team: playerObj.team,
				mmrChange: playerObj.mmrChange,
			}
			players[`team${ playerObj.team}`].push(player);
		});
		result.players = players;
		return result;
	} else {
		return 'No game found for player';
	}
}
