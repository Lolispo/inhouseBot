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
	if (message.length >= 2000) {
		let sent = false;
		for(let i = 2000; i >= 0; i--) {
			if(message.charAt(i) === '\n') {
				const firstMessage = message.substring(0, i);
				const restMessage = message.substring(i);
				messageVar.channel.send(firstMessage)
				.then(result => {
					callback(result);
				}).catch(err => console.log('@print (splitted) for ' + message + ' :\n' + err));
				print(messageVar, restMessage, callback);
				sent = true;
				break;
			}
		}
		if (!sent) { // No newline in message, split content on max size
			const maxIndex = 1900;
			const firstMessage = message.substring(0, maxIndex); // Margin
			const restMessage = message.substring(maxIndex);
			messageVar.channel.send(firstMessage)
			.then(result => {
				callback(result);
			}).catch(err => console.log('@print (splitted) for ' + message + ' :\n' + err));
			print(messageVar, restMessage, callback);
		}
	} else {
		messageVar.channel.send(message)
		.then(result => {
			callback(result);
		}).catch(err => console.log('@print for ' + message + ' :\n' + err));
	}
}

var listToDeleteFrom = new Map();

var deleteDiscMessage = function(messageVar, time = bot.getRemoveTime(), messageName = 'defaultName', callback = function(msg) {}){
	// Alt. (Somehow) Compare freshest time, delete other timeout
	//console.log('DEBUG @delete1 for ' + messageName + ', addDelete(' + time + ') = ' + (!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && messageVar.content !== ''), listToDeleteFrom.has(messageName));
	messageName = messageName + '.id='+messageVar.id;
	if(!listToDeleteFrom.has(messageName) && !isUndefined(messageVar) && messageVar.content !== ''){
		if(!messageVar.content.includes('<removed>')){ // TODO: If repeated attempts are made to delete same thing, reflect if <removed> should be added
			listToDeleteFrom.set(messageName, messageVar);	
		}
	}
	setTimeout(function(){
		console.log('----- @Delete Message --- for ' + messageName + ':', listToDeleteFrom.has(messageName), time);
		if(listToDeleteFrom.has(messageName)){ // Makes sure it isn't already deleted
			console.log('DEBUG @f.deleteDiscMessage', messageName, listToDeleteFrom.has(messageName));
			listToDeleteFrom.delete(messageName);
			messageVar.delete()
			.then(res => {
				callback(res); // Use optional callback (Default noop)
			}).catch(err => {
				console.log('@delete for ' + messageName + ' (' + time + '): \n' + err);
				callback(messageVar);	// Call callback anyway, even if print isn't made
			});
		}
	}, time);
}

// Used on exit, should delete all messages that are awaiting deletion instantly
var onExitDelete = function(){
	console.log('DEBUG @onExitDelete: Deleting all messages awaiting deletion');
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
		} else {
			console.log(messageRead + data);
			callback(data);			
		}
	});
}

// Takes an Array of Players and returns an Array of GuildMembers with same ids
 var teamToGuildMember = function(team, activeMembers) {
	var teamMembers = new Array;
	if(isUndefined(activeMembers)){
		console.log('Error: activeMembers not initialized in @teamToGuildMember (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
	}else{
		team.forEach(function(player){
			var guildMember = activeMembers.find(function(guildMember){
				return player.uid === guildMember.id;
			});
			if(!isUndefined(guildMember)){
				teamMembers.push(guildMember);
			}
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
// TODO Print``
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

// TODO: Redo all public functions like this? Atleast in file that requires usage on methods from both inside and outside (currently f and db_sequelize)
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