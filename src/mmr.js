'use strict';
// Author: Petter Andersson and Robert Wörlund

const bot = require('./bot');
const db_sequelize = require('./db_sequelize');

/*
	Handles MMR calculations and updates
	Uses db_sequelize to update mmr for all the players
	Uses bot to return the updated mmr to the disc clients
*/

// Update mmr for all players and returns result to clients
exports.updateMMR = function(winner, gameObject, callbackUpdate){ // winner = 0 -> draw, 1 -> team 1, 2 -> team 2
	var balanceInfo = gameObject.getBalanceInfo();
	var mmrChange = eloUpdate(balanceInfo.avgT1, balanceInfo.avgT2, winner); 
	updateTeamMMR(balanceInfo.team1, mmrChange.t1, balanceInfo.game);
	updateTeamMMR(balanceInfo.team2, mmrChange.t2, balanceInfo.game);

	buildMMRUpdateString(winner, callbackResult, balanceInfo.team1, balanceInfo.team2, callbackUpdate, balanceInfo.game, gameObject);
}

// Calculates the mmr change for two teams with given average team mmr and winner
function eloUpdate(t1mmr, t2mmr, winner){
	const K = 50;
	//transformed ratings for t1 and t2
	var t1_trans = Math.pow(10, t1mmr/400);
	var t2_trans = Math.pow(10, t2mmr/400);

	//estimated ratings for t1 and t2
	var est1 = t1_trans / (t1_trans+t2_trans);
	var est2 = t2_trans / (t1_trans+t2_trans);

	//actual score of winner
	var score1 = 0;
	var score2 = 0;

	switch(winner){
		case 1:
			score1 = 1;
			break;
		case 2:
			score2 = 1;
			break;
		default:
			//draw
			score1 = 0.5;
			score2 = 0.5;
	}

	//new mmr for t1 and t2
	var t1_new = t1mmr + K * (score1 - est1);
	var t2_new = t2mmr + K * (score2 - est2);

	//console.log('DEBUG: @eloupdate, ', t1_new, t1mmr, Math.round(t1_new), Math.round(t1_new)-t1mmr, Math.round(t1_new-t1mmr));

	return { // Changed to round everything since t1mmr are averages and can be doubles
		t1: Math.round(t1_new-t1mmr),
		t2: Math.round(t2_new-t2mmr)
	};
}

// Update team mmr for the given team locally and in database
function updateTeamMMR(team, change, game){
	for(var i = 0; i < team.length; i++){
		var newMMR = team[i].getMMR(game) + change;
		team[i].setMMRChange(game, change);
		team[i].setMMR(game, newMMR);
		team[i].setPlusMinus(game, (change > 0 ? '+' : ''));
		db_sequelize.updateMMR(team[i].uid, newMMR, game);
	}
}

// After a finished game, prints out new updated mmr
// TODO: Print``
function buildMMRUpdateString(team1Won, callback, T1, T2, callbackUpdate, game, gameObject){
	var s = ''; 
	s += '**Team ' + (team1Won ? '1' : '2') + ' won!** Played game: **' + game + '**. Updated mmr is: \n';
	s += '**Team 1**: \n\t*' + T1[0].userName + ' (' + T1[0].getMMR(game) + ' mmr, ' + T1[0].getGame(game).prevMMR + ' ' + T1[0].getGame(game).latestUpdatePrefix + T1[0].getGame(game).latestUpdate + ')';
	for(var i = 1; i < T1.length; i++){
		s += '\n\t' + T1[i].userName + ' (' + T1[i].getMMR(game) + ' mmr, ' + T1[i].getGame(game).prevMMR + ' ' + T1[i].getGame(game).latestUpdatePrefix + T1[i].getGame(game).latestUpdate + ')';
	}
	s += '*\n';
	s += '**Team 2**: \n\t*' + T2[0].userName + ' (' + T2[0].getMMR(game) + ' mmr, ' + T2[0].getGame(game).prevMMR + ' ' + T2[0].getGame(game).latestUpdatePrefix + T2[0].getGame(game).latestUpdate + ')';
	for(var i = 1; i < T2.length; i++){
		s += '\n\t' + T2[i].userName + ' (' + T2[i].getMMR(game) + ' mmr, ' + T2[i].getGame(game).prevMMR + ' ' + T2[i].getGame(game).latestUpdatePrefix + T2[i].getGame(game).latestUpdate + ')';
	}
	s += '*\n';
	callback(gameObject, s, callbackUpdate);
}

function callbackResult(gameObject, message, callback){
	// TODO Game: Get Game instead, have printMessage
	bot.printMessage(message, gameObject.getChannelMessage(), callback);
}



