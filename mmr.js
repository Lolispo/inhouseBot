'use strict';
// Author: Petter Andersson and Robert Wörlund

const bot = require('./bot');
const db_sequelize = require('./db-sequelize');

/*
	Handles MMR calculations and updates
	Uses db_sequelize to update mmr for all the players
	Uses bot to return the updated mmr to the disc clients
*/

// Update mmr for all players and returns result to clients
exports.updateMMR = function(winner, balanceInfo, callbackUpdate){ // winner = 0 -> draw, 1 -> team 1, 2 -> team 2
	var mmrChange = eloUpdate(balanceInfo.avgT1, balanceInfo.avgT2, winner); 
	updateTeamMMR(balanceInfo.team1, mmrChange.t1, balanceInfo.game);
	updateTeamMMR(balanceInfo.team2, mmrChange.t2, balanceInfo.game);

	buildMMRUpdateString(winner, callbackResult, balanceInfo.team1, balanceInfo.team2, callbackUpdate);
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
	for(var i = 0; i < team.size(); i++){
		var newMMR = team[i].getMMR(game) + change;
		team[i].setMMRChange(game, change);
		team[i].setMMR(game, newMMR);
		team[i].setPlusMinus(game, (change > 0 ? '+' : ''));
		db_sequelize.updateMMR(team[i].uid, newMMR, game); // TODO: Check, error might be from here, since result is not awaited. Redo with method for await?
		// TODO on more mmr: , mmrType
	}
}

// After a finished game, prints out new updated mmr
// TODO: Decide the best design for mmr syntax, currently (1150, 1100 +50)
function buildMMRUpdateString(team1Won, callback, T1, T2, callbackUpdate){
	var s = '';
	s += '**Team ' + (team1Won ? '1' : '2') + ' won!** Updated mmr is: \n';
	s += '**Team 1**: \n\t*' + T1[0].userName + ' (' + T1[0].mmr + ' mmr, ' + T1[0].prevMMR + ' ' + T1[0].latestUpdatePrefix + T1[0].latestUpdate + ')';
	for(var i = 1; i < T1.size(); i++){
		s += '\n\t' + T1[i].userName + ' (' + T1[i].mmr + ' mmr, ' + T1[i].prevMMR + ' ' + T1[i].latestUpdatePrefix + T1[i].latestUpdate + ')';
	}
	s += '*\n';
	s += '**Team 2**: \n\t*' + T2[0].userName + ' (' + T2[0].mmr + ' mmr, ' + T2[0].prevMMR + ' ' + T2[0].latestUpdatePrefix + T2[0].latestUpdate + ')';
	for(var i = 1; i < T2.size(); i++){
		s += '\n\t' + T2[i].userName + ' (' + T2[i].mmr + ' mmr, ' + T2[i].prevMMR + ' ' + T2[i].latestUpdatePrefix + T2[i].latestUpdate + ')';
	}
	s += '*\n';
	callback(0, s, callbackUpdate);
}

function callbackResult(stage, message, callback){
	bot.setStage(stage);
	bot.printMessage(message, callback);
}



