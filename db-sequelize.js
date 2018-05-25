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
	*/

	Users = sequelize.define('users', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
		gamesPlayed: Sequelize.INTEGER
	}, {
		timestamps: false
	}); 
}

// Returns table of users
exports.getTable = function(callback){
	Users.findAll({})
	.then(function(result) {
		callback(result);
	})
}; 

// Gets Top 5 users ordered by mmr
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
exports.createUser = function(uid, userName, mmr){
	console.log('DEBUG: @createUser', );
	Users.create({ uid: uid, userName: userName, mmr: mmr, gamesPlayed: 0})
	.then(function(result){
		console.log(result.get({plain:true}))
	});
}