'use strict;'

const ArrayList = require('arraylist');
const moment = require('moment');
const db_sequelize = require('./db-sequelize');
/*
 	TODO Big:
 		Database for saving data connected to user
 			Can use sequelize as in lab, store ID | MMR
 		Refactor ugly solutions
		Implement MMR Update (Req mmr save for full implementation)
			ELO math theory could be looked at

		Player
			Add dynamic storage of mmr for support of more games, potential of aim map skill 2v2
*/

exports.initializePlayers = function(players, dbpw){
	// Init mmr for players
	db_sequelize.initDb(dbpw);
	var uids = [];
	for(var i = 0; i < players.size(); i++){
		uids.push(players[i].discID);
	}
	console.log('DEBUG: @initializePlayers, uids =', uids);
	var usersTable = db_sequelize.getTable(players);
	console.log(usersTable);
	return balanceTeams(players);		
}

// @param players should contain ArrayList of initialized Players of people playing
function balanceTeams(players){
	// console.log('DEBUG: @balanceTeams');
	// Generate team combs, all possibilities of the 10 players
	var teamCombs = generateTeamCombs(players);
	
	var result = findBestTeamComb(players, teamCombs);

	var stringToReturn = buildReturnString(result);
	// Return string to message to clients
	console.log(stringToReturn);
	return stringToReturn;
}

// TODO Refactor: Should make less repetitive code
// Generates the combinations for different team sizes
// uniqueCombs makes sure that duplicates aren't saved (Unsure if uniqueSum even helps, should in theory)
// @return teamCombs is returned with all possible matchups
function generateTeamCombs(players){
	var teamCombs = [];   // Saves all team combination, as arrays of indexes of 5 (other team is implied)
	var uniqueCombs = new ArrayList; // A number combination for each comb, to prevent saving duplicates.
	var len = players.size();
	for(var i = 0; i < len; i++){
		for(var j = i+1; j < len; j++){
			for(var k = j+1; k < len; k++){
				for(var l = k+1; l < len; l++){
					for(var m = l+1; m < len; m++){
						if(len === 10){
							var uniqueSum = uniVal(i) + uniVal(j) + uniVal(k) + uniVal(l) + uniVal(m); 
							if(!uniqueCombs.contains(uniqueSum)){	
								var teamComb = [i,j,k,l,m]
								teamCombs.push(teamComb); // Add new combination to teamCombs // [i,j,k,l,m]
								uniqueCombs.add(uniqueSum);
							} 	
						}					
					}
					if(len === 8){
						var uniqueSum = uniVal(i) + uniVal(j) + uniVal(k) + uniVal(l); 
						if(!uniqueCombs.contains(uniqueSum)){	
							var teamComb = [i,j,k,l]
							teamCombs.push(teamComb); // Add new combination to teamCombs // [i,j,k,l]
							uniqueCombs.add(uniqueSum);
						} 	
					}
				}
				if(len === 6){
					var uniqueSum = uniVal(i) + uniVal(j) + uniVal(k); 
					if(!uniqueCombs.contains(uniqueSum)){	
						var teamComb = [i,j,k]
						teamCombs.push(teamComb); // Add new combination to teamCombs // [i,j,k]
						uniqueCombs.add(uniqueSum);
					} 	
				}
			}
			if(len === 4){
				var uniqueSum = uniVal(i) + uniVal(j); 
				if(!uniqueCombs.contains(uniqueSum)){	
					var teamComb = [i,j]
					teamCombs.push(teamComb); // Add new combination to teamCombs // [i,j]
					uniqueCombs.add(uniqueSum);
				} 	
			}
		}
	}

	//console.log('DEBUG: @generateTeamCombs, teamCombs = ', teamCombs, teamCombs.length, uniqueCombs, uniqueCombs.size());
	return teamCombs;
}

function findBestTeamComb(players, teamCombs){
	// Compare elo matchup between teamCombinations, lowest difference wins
	var bestPossibleTeamComb = Number.MAX_VALUE;
	var t1 = [];
	var t2 = [];
	var avgTeam1 = -1;
	var avgTeam2 = -1;
	var index = -1;
	for(var i = 0; i < teamCombs.length; i++){
		var teams = getBothTeams(teamCombs[i], players);
		//console.log('DEBUG: @findBestTeamComb, getBothTeams = ', teams);
		var res = mmrCompare(teams.t1, teams.t2);
		//console.log('DEBUG: @findBestTeamComb, mmrCompare = ', res);
		if(res.diff < bestPossibleTeamComb){
			bestPossibleTeamComb = res.diff;
			avgTeam1 = res.avgT1;
			avgTeam2 = res.avgT2;
			t1 = teams.t1;
			t2 = teams.t2;
			index = i;
		}
	}

	// Retrieved most fair teamComb
	return {team1 : t1, team2 : t2, difference : bestPossibleTeamComb, avgT1 : avgTeam1, avgT2 : avgTeam2, avgDiff : Math.abs(avgTeam1 - avgTeam2).toFixed(2)}; // Remove teamComb
}

// Unique number combinations for combinations of 5.
// Should give (check): 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
// TODO Test
function uniVal(x){
	return (x * Math.pow(10, (x % 5)));
}

// Get the two teams of players from the teamComb
function getBothTeams(teamComb, players){
	var team1 = new ArrayList;
	var team2 = new ArrayList;
	for(var i = 0; i < players.size(); i++){
		var contains = false;
		for(var j = 0; j < teamComb.length; j++){ // TODO Refactor/Redo. Do better check for this contain check, teamComb = list ([])
			if(i === teamComb[j]){
				contains = true;
			}
		}
		if(contains){
			team1.add(players[i]);
		} else {
			team2.add(players[i]);
		}
	}
	//console.log('DEBUG: @getBothTeams, team1 = ', team1, '\nteam2 = ', team2, 'teamComb', teamComb);
	return {t1 : team1, t2 : team2};
}

// @param two teams of players
// @return total mmr difference
function mmrCompare(t1, t2){
	var avgTeam1 = addTeamMMR(t1); 
	var avgTeam2 = addTeamMMR(t2); 
	var difference = Math.abs(avgTeam1 - avgTeam2);
	return {diff : difference, avgT1 : (avgTeam1 / t1.length), avgT2 : (avgTeam2 / t2.length)};
}

function addTeamMMR(team){ // Function to be used in summing over players
	var sum = 0;
	for(var i = 0; i < team.length; i++){
		sum += team[i].mmr;
	}
	//console.log('DEBUG: @addTeamMMR, team = ', team, 'TeamMMR:', sum);
	return sum;
}

// Build a string to return to print as message
function buildReturnString(obj){ // TODO: Make print consistently nice
	// Check if adjustment is needed
	var date = moment().format('LLL');
	var s = '';
	s += 'MMR Average difference: ' + obj.avgDiff + ' (Total: ' + obj.difference + 'p). ';
	s += String(date);
	s += '\n';
	s += 'T1: ' + obj.team1[0].userName + ' (' + obj.team1[0].mmr + ')';
	for(var i = 1; i < obj.team1.length; i++){
		s += ',\t' + obj.team1[i].userName + ' (' + obj.team1[i].mmr + ')';
	}	
	s += '. \tAvg: ' + obj.avgT1;
	s += '\n';
	s += 'T2: ' + obj.team2[0].userName + ' (' + obj.team2[0].mmr + ')';
	for(var i = 1; i < obj.team2.length; i++){
		s += ',\t' + obj.team2[i].userName + ' (' + obj.team2[i].mmr + ')';
	}
	s += '. \tAvg: ' + obj.avgT2;
	s += '\n';
	return s;
}

function Player(username, discId){
	this.userName = username;
	this.discID = discId;
	this.defaultMMR = 1000; // TODO: Adjust to elo system
	this.mmr; 
	// Check if existing mmr exist for discID in database, otherwise set as default mmr
	if( false ){ // <- Check in db
		// TODO
	} else{
		this.mmr = this.defaultMMR;
	}

	this.setMMR = function(value){
		this.mmr = value;
	}
}

exports.createTempPlayer = function(username, discId, mmr){
	var player = new Player(username, discId);
	player.setMMR(mmr);
	return player;
}

exports.createPlayer = function(username, discId){
	return new Player(username, discId);
}


