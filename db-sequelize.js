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
		uid: Sequelize.INTEGER, 
		userName: Sequelize.STRING,
		mmr: Sequelize.INTEGER,
	}, {
		timestamps: false
	}); 
}

/* Returns table of users */
exports.getTable = function(uids){
	Users
	.findAll({
	where: {
		uid: uids 	/* Should be where uid is in uids */
	}, 
	order: [['userName', 'ASC']]
	})
	.then(function(result) {
		return result;
	})
}; 

exports.updateMMR = function(uid, newMmr){
	Users.findById(uid).then(function(user) {
		user
		.update({
			mmr: newMmr
	    }).then(function(){
			console.log('User (id =', uid + ') new mmr set to ' + newMmr)
		})
	});
}