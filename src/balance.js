'use strict';
// Author: Petter Andersson

const bot = require('./bot');
const game_js = require('./game');

/*
	Handles getting the most balanced team matchup for the given 10 players
	Uses bot to return the teams to the discord clients

	Since currently only mmr is needed, to algorithm could be simplified as placing players in different sorted by highest mmr, same result
	Current implementation support addition of other factors, language support/known players etc
	TODO: Check if this would work if restrictions for team sizes are removed, generateTeamCombs changes required
*/

// @param players should contain Array of initialized Players of people playing
exports.balanceTeams = function(players, game, gameObject){
	// Generate team combs, all possibilities of the 10 players
	var teamCombs = generateTeamCombs(players);
	var result = findBestTeamComb(players, teamCombs, game);

	// Return string to message to clients
	buildReturnString(result, gameObject, callbackBalanceInfo); // callbackBalanceInfo = method 
}

// Generates the combinations for different team sizes
// uniqueCombs makes sure that duplicates aren't saved
// @return teamCombs is returned with all possible matchups
function generateTeamCombs(players){
	//console.log('DEBUG: @generateTeamCombs');
	var teamCombs = [];   // Saves all team combination, as arrays of indexes of one team (other team is implied)
	var uniqueCombs = new Set(); // A number combination for each comb, to prevent saving duplicates.
	var len = players.length;
	if(len === 2){
		teamCombs.push([0]); // Only one team exist, its one player
		return teamCombs;
	}

	recursiveFor(0, [], len, 0, teamCombs, uniqueCombs);

	//console.log('DEBUG: @generateTeamCombs, teamCombs = ', teamCombs, teamCombs.length, uniqueCombs, uniqueCombs.size);
	return teamCombs;
}

// Fills teamCombs with the teamcombination given amount of players
function recursiveFor(startIndex, indexes, len, forloopindex, teamCombs, uniqueCombs){
	for(var i = startIndex; i < len; i++){
		var indexesArray = indexes.slice();
		indexesArray.push(i);
		if(forloopindex < len/2){
			recursiveFor(startIndex + 1, indexesArray, len, forloopindex + 1, teamCombs, uniqueCombs);
		} else {
			combinationAdder(teamCombs, uniqueCombs, indexesArray);
		}
	}
}

// Store combinations for the given player indexes (players) and stores it in teamcombs
// uniqueCombs holds a number that represent equal combinations of players, as well as their reverseComb
function combinationAdder(teamCombs, uniqueCombs, players){
	const adder = (accumulator, currentValue) => accumulator + currentValue;
	var uniqueSum = players.map(uniVal).reduce(adder);  // Sum over uniVal for each player index, creating unique sum
	if(!uniqueCombs.has(uniqueSum)){	
		var teamComb = players;
		teamCombs.push(teamComb); // Add new combination to teamCombs
		uniqueCombs.add(uniqueSum);
		uniqueCombs.add(reverseUniqueSum(players, players.length * 2)); // Removes so [0,1,2,3,4] is the same as [5,6,7,8,9]
	} 	
}

// Unique number combinations for combinations of 5.
// Should give (check): 0: 0, 1: 10, 2: 200, 3: 3000, 4: 40000, 5: 5, 6: 60, 7: 700, 8: 8000; 9: 90000
function uniVal(x){
	return (x * Math.pow(10, (x % 5)));
}

// Fixar så [0,1,2,3,4] combos = [5,6,7,8,9] combos, no duplicates for them
function reverseUniqueSum(list, len){
	//console.log('DEBUG: @reverseUniqueSum', list, len);
	var sum = 0;
	for(var i = 0; i < len; i++){
		var exists = false;
		for(var j = 0; j < list.length; j++){
			if(list[j] === i){
				exists = true;
				break;
			}
		}
		if(!exists){
			sum += uniVal(i);
		}
	}
	return sum;
}

// Compare elo matchup between teamCombinations, lowest difference wins
function findBestTeamComb(players, teamCombs, game){
	var bestPossibleTeamComb = Number.MAX_VALUE;
	var t1 = [];
	var t2 = [];
	var multiple_t1 = [];
	var multiple_t2 = [];
	var avgTeam1 = -1;
	var avgTeam2 = -1;
	for(var i = 0; i < teamCombs.length; i++){
		var teams = getBothTeams(teamCombs[i], players);
		var res = mmrCompare(teams.t1, teams.t2, game);
		if(res.diff < bestPossibleTeamComb){ 
			bestPossibleTeamComb = res.diff;
			avgTeam1 = res.avgT1;
			avgTeam2 = res.avgT2;
			t1 = teams.t1;
			t2 = teams.t2;
			multiple_t1 = [t1];
			multiple_t2 = [t2];
		} else if(res.diff === bestPossibleTeamComb){ // Random aspect between combinations when combinations have same result
			// Should contain same avg rating
			multiple_t1.push(teams.t1);
			multiple_t2.push(teams.t2);
		}
	}

	// Random from equal
	if(multiple_t1.length > 1 && multiple_t2.length > 1){
		var index = Math.floor(Math.random() * multiple_t1.length); // Random index chosen as teamcombination from equal ones
		t1 = multiple_t1[index];
		t2 = multiple_t2[index];
	}

	// Retrieved most fair teamComb
	return {team1 : t1, team2 : t2, difference : bestPossibleTeamComb, avgT1 : avgTeam1, avgT2 : avgTeam2, avgDiff : Math.abs(avgTeam1 - avgTeam2).toFixed(2), game: game}; 
}

// Get the two teams of players from the teamComb
function getBothTeams(teamComb, players){
	var team1 = [];
	var team2 = [];
	for(var i = 0; i < players.length; i++){
		var contains = false;
		for(var j = 0; j < teamComb.length; j++){ // TODO Refactor/Redo. Do better check for this contain check, teamComb = list ([])
			if(i === teamComb[j]){
				contains = true;
			}
		}
		if(contains){
			team1.push(players[i]);
		} else {
			team2.push(players[i]);
		}
	}
	//console.log('DEBUG: @getBothTeams, team1 = ', team1, '\nteam2 = ', team2, 'teamComb', teamComb);
	return {t1 : team1, t2 : team2};
}

// @param two teams of players
// @return total mmr difference
function mmrCompare(t1, t2, game){
	var avgTeam1 = addTeamMMR(t1, game); 
	var avgTeam2 = addTeamMMR(t2, game); 
	var difference = Math.abs(avgTeam1 - avgTeam2);
	return {diff : difference, avgT1 : (avgTeam1 / t1.length), avgT2 : (avgTeam2 / t2.length)};
}

function addTeamMMR(team, game){ // Function to be used in summing over players
	var sum = 0;
	for(var i = 0; i < team.length; i++){
		sum += team[i].getMMR(game);
	}
	//console.log('DEBUG: @addTeamMMR, team = ', team, 'TeamMMR:', sum);
	return sum;
}

// Build a string to return to print as message
function buildReturnString(obj, gameObject, callback){ // TODO: Print``
	var s = '';
	//console.log('@buildReturnString', obj)
	s += '**New Game!** Playing **' + obj.game + '**. ';
	if(obj.team1.length === 1){ // No average for 2 player matchup
		s += 'MMR diff: ' + obj.difference + ' mmr. ';
	} else{
		s += 'MMR Avg diff: ' + parseFloat(obj.avgDiff).toFixed(2) + ' mmr (Total: ' + obj.difference + ' mmr). ';	
	}
	s += '\n';
	s += '**Team 1** \t(Avg: ' + obj.avgT1 + ' mmr): \n*' + obj.team1[0].userName + ' (' + obj.team1[0].getMMR(obj.game) + ')';
	for(var i = 1; i < obj.team1.length; i++){
		s += ',\t' + obj.team1[i].userName + ' (' + obj.team1[i].getMMR(obj.game) + ')';
	}
	s += '*\n';
	s += '**Team 2** \t(Avg: ' + obj.avgT2 + ' mmr): \n*' + obj.team2[0].userName + ' (' + obj.team2[0].getMMR(obj.game) + ')';
	for(var i = 1; i < obj.team2.length; i++){
		s += ',\t' + obj.team2[i].userName + ' (' + obj.team2[i].getMMR(obj.game) + ')';
	}
	s += '*\n\n';
	s += '*Connect:* \n**' + bot.getLukasIP() + '**'; // Lukas' server on datHost, requires Petter/Lukas/Martin ingame to use
	callback(gameObject, s, obj); // Should send the message back to the bot
}

function callbackBalanceInfo(gameObject, message, obj){	
	gameObject.setBalanceInfo(obj);
	bot.printMessage(message, gameObject.getChannelMessage(), function(message){
		gameObject.setMatchupServerMessage(message);
	});
}
