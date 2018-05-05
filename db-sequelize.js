'use strict';

var Sequelize = require('sequelize');
var sequelize = {};
var Users = {};

exports.initDb = function(dbpw){
	sequelize = new Sequelize('pettea', 'pettea_admin', dbpw, {
		host: 'mysql-vt2016.csc.kth.se',
		dialect: 'mysql',
		operatorsAliases: false
	});

	/* Table: 'users': 
	uid int NOT NULL, PRIMARY KEY (uid)
	userName VARCHAR(64), 
	mmr int, 
	*/

	Users = sequelize.define('users', {
		uid: {type: Sequelize.INTEGER, primaryKey: true},
		userName: Sequelize.TEXT,
		mmr: Sequelize.INTEGER,
	}, {
		timestamps: false
	}); 
}

/* Returns table of users */
exports.getTable = function(uids, callback){
	Users.findAll({
	})
	.then(function(result) {
		callback(result);
	})
	/*
	Users
	.findAll({
	where: {
		uid: uids 	/* Should be where uid is in uids *//*
	}, 
	order: [['userName', 'ASC']]
	})
	.then(function(result) {
		return result;
	})
	*/
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

exports.createUser = function(uid, userName, mmr){
	Users.create({ uid: uid, userName: userName, mmr: mmr})
	.then(function(result){
		console.log(result.get({plain:true}))
	});
}