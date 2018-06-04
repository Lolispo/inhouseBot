'use strict';
// Author: Petter Andersson

// Should handle general help functions
const bot = require('./bot')
var fs = require('fs');

/*
var nodeCleanup = require('node-cleanup');
// TODO Cleanup on exit, can't control SIGINT (ctrl+c) Correctly, requires synchronous code
nodeCleanup(function (exitCode, signal) {
    // release resources here before node exits
    onExitDelete();
});
*/

// Returns boolean over if type of obj is undefined
// Could add function isNotUndefined for readability, replace !isUndefined with isNotUndefined
var isUndefined = function(obj){
	return (typeof obj === 'undefined');
}

// Used to print message in channel, use for every use of channel.send for consistency
// Returns promise for use in async functions
var print = function(messageVar, message, callback = callbackPrintDefault){
	console.log('> ' + message);
	messageVar.channel.send(message)
	.then(result => {
		callback(result);
		// TODO: Remove on exit
	}).catch(err => console.log('@print for ' + message + ' :\n' + err));
}

var listToDeleteFrom = new Map();

var deleteDiscMessage = function(messageVar, time = bot.getRemoveTime(), messageName = 'defaultName', callback = function(msg) {}){
	// Alt. (Somehow) Compare freshest time, delete other timeout
	//console.log('DEBUG @delete1 for ' + messageName + ', addDelete(' + time + ') = ' + (!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && messageVar.content !== ''), listToDeleteFrom.has(messageName));
	if(!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && messageVar.content !== ''){
		if(!messageVar.content.includes('<removed>')){
			listToDeleteFrom.set(messageName, messageVar);	
		}
	}
	setTimeout(function(){
		//console.log('DEBUG @delete2 for ' + messageName + ':', listToDeleteFrom.has(messageName), time);
		if(listToDeleteFrom.has(messageName)){ // Makes sure it isn't already deleted
			listToDeleteFrom.delete(messageName); // TODO: Adjust this, should remove but make sure it continues to work. Remove since there seem to be no way of knowing if message is deleted
			messageVar.delete()
			.then(res => {
				callback(res); // Use optional callback (Default noop)
			}).catch(err => console.log('@delete for ' + messageName + ' (' + time + '): \n' + err));
		}
	}, time);
}

// Used on exit, should delete all messages that are awaiting deletion instantly
var onExitDelete = function(){
	console.log('onExitDelete');
	var mapIter = listToDeleteFrom.values();
	for(var i = 0; i < listToDeleteFrom.size; i++){
		var ele = mapIter.next().value;
		//console.log(ele.content);
		ele.delete()	
		.catch(err => console.log('@onExitDelete' + err));
	}
}

function callbackPrintDefault(message){
	deleteDiscMessage(message);
}

var writeToFile = function(filePath, contentToWrite, messageOnSuccess){
	fs.writeFile(filePath, contentToWrite, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log(messageOnSuccess);
	}); 
}

var readFromFile = function(filePath, messageRead, callback, callbackError){
	fs.readFile(filePath, 'utf8', function (err,data) {
		if (err || isUndefined(data)) {
			console.log(err);
			callbackError();
		}
		console.log(messageRead + data);
		callback(data);
	});
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
// TODO Use me together with `` blocks
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
	deleteDiscMessage : deleteDiscMessage,
	onExitDelete : onExitDelete,
	teamToGuildMember : teamToGuildMember,
	getLongestNameLength : getLongestNameLength,
	getTabsForName : getTabsForName,
	writeToFile : writeToFile,
	readFromFile : readFromFile
}