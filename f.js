'use strict';
// Author: Petter Andersson

// Should handle general help functions
const bot = require('./bot')

// Returns boolean over if type of obj is undefined
// Could add function isNotUndefined for readability, replace !isUndefined with isNotUndefined
var isUndefined = function(obj){
	return (typeof obj === 'undefined');
}

// Used to print message in channel, use for every use of channel.send for consistency
// Returns promise for use in async functions
var print = function(messageVar, message, callback = callbackPrintDefault){
	console.log(message);
	messageVar.channel.send(message)
	.then(result => {
		callback(result);
		// TODO: Remove on exit
	});
}

function callbackPrintDefault(message){
	message.delete(bot.getRemoveTime());
}

// Takes an Array of Players and returns an Array of GuildMembers with same ids
 var teamToGuildMember = function(team, activeMembers) {
	var teamMembers = new Array;
	if(isUndefined(activeMembers)){
		console.log('Error: activeMembers not initialized in @teamToGuildMember (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
	}else{
		team.forEach(function(player){
			activeMembers.forEach(function(guildMember){
				if(player.uid === guildMember.id){
					teamMembers.push(guildMember);
				}
			});
		});		
	}
	return teamMembers;
}

// Idea put on hold - hard to detect character width
// gets longestName length
var getLongestNameLength = function(activePlayers){
	var longestName = -1;
	activePlayers.forEach(function(oneData){
		if(oneData.userName.length > longestName){
			longestName = oneData.userName.length;
		}
	});
	return longestName;
}

/*
	Returns string of tabs to align to given biggest name
	Example:
	Petter - 6
	Bambi på hal is - 15
	diff = 9
	s = ' \t\t\t'
	s2 = '\t'
*/
var getTabsForName = function(nameLength, longestName){
	console.log('DEBUG: @getTabsForName', longestName, nameLength);
	var discTabSize = 4;
	var diff = longestName - nameLength;
	var s = '';
	/*
	for(var i = 0; i < diff; i++){
		s += ' ';
	}*/
	for(var i = 0; i < (diff % discTabSize); i++){
		s += '  ';
	}
	for(var i = 0; i < diff; i += discTabSize){
		s += '\t';
	}
	return s;
}

// TODO: Redo all public functions like this?
module.exports = {
	isUndefined : isUndefined,
	print : print,
	teamToGuildMember : teamToGuildMember,
	getLongestNameLength : getLongestNameLength,
	getTabsForName : getTabsForName
}