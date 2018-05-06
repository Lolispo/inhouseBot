'use strict';

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

exports.initDb = function(dbpw){
	sequelize = new Sequelize('pettea', 'pettea_admin', dbpw, {
		host: 'mysql-vt2016.csc.kth.se',
		dialect: 'mysql',
		operatorsAliases: false
	});

	/* 		
		db:
			Table: 'users': 
		uid VARCHAR(64) NOT NULL, PRIMARY KEY (uid)
		userName VARCHAR(64), 
		mmr int, 
	*/

	Users = sequelize.define('users', {
		uid: {type: Sequelize.STRING, primaryKey: true},
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
	}, {
		timestamps: false
	}); 
}

// Returns table of users
exports.getTable = function(uids, callback){
	Users.findAll({})
	.then(function(result) {
		callback(result);
	})
}; 

// TODO Feature: Record amount of games played
exports.updateMMR = function(uid, newMmr){
	Users.findById(uid).then(function(user) {
		user
		.update({
			mmr: newMmr
	    }).then(function(){
			//console.log('User (id =', uid + ') new mmr set to ' + newMmr)
		})
	});
}

// Add a user to database
exports.createUser = function(uid, userName, mmr){
	console.log('DEBUG: @createUser', );
	/*
	sequelize.query('INSERT INTO users (uid, userName, mmr) VALUES ("' + uid + '","' + userName + '",' + mmr + ')')
	.then(result => {
		console.log(result)
	});
	*/
	Users.create({ uid: uid, userName: userName, mmr: mmr})
	.then(function(result){
		console.log(result.get({plain:true}))
	});
}