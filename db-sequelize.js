'use strict';

var Sequelize = require('sequelize');
var sequelize = {};
var Users = {};

exports.initDb = function(dbpw){
	sequelize = new Sequelize('pettea', 'pettea_admin', dbpw, {
		host: 'mysql-vt2016.csc.kth.se',
		dialect: 'mysql'
	});

	/* Table: 'users': 
	uid int NOT NULL, PRIMARY KEY (uid)
	userName VARCHAR(64), 
	mmr int, 
	*/

	Users = sequelize.define('users', {
		uid: Sequelize.INTEGER, 
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
	}, {
		timestamps: false
	}); 
}

/* Returns table of users */
exports.getTable = function(dbpw, uids){
	Users
	.findAll({
	where: {
		uid: uids 	/* Should be where uid is in uids */
	}, 
	order: [['userName', 'ASC']]
	})
	.then(function(result) {
		
	})
}; 

exports.updateMMR = function(dbpw, uids, mmrs){
	Users
	.update({
	where: {
		uid: uids 	
	}, 
	
	})
	.then(function(result) {
		
	})	
}