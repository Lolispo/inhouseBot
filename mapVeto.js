'use strict';
// Author: Petter Andersson

// Handles map veto system, to choose maps between teams

const bot = require('./bot');
const player_js = require('./player');
const f = require('./f');
var captain1;			// Captain for team 1
var captain2;			// Captain for team 2
var mapMessages;		// Keeps track of the discord messages for the different maps 
var mapVetoTurn;		// Turn variable, whose turn it is
var bannedMaps = [];	// String array holding who banned which map, is used in mapStatusMessage

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

var captainVote = function(messageReaction, user, i){
	console.log('DEBUG: CaptainVote', user.username, 'i = ', i, 'turn = ', mapVetoTurn);
	if(user.id === captain1.uid && mapVetoTurn === 0){ // Check to see if author is a captain and his turn
		var tempMessage = mapMessages[i]; 
		var presentableName = String(tempMessage).split('\n')[1];
		bannedMaps.push(user.username + ' banned ' + presentableName); // Maybe should add bold on second to last one
		mapMessages.splice(i, 1); // splice(index, howMany)
		tempMessage.delete(400);
		changeTurn();
		if(mapMessages.length === 1){ // We are done and have only one map left
			var chosenMap = mapMessages[0];
			mapMessages = undefined; // TODO: More beutiful line for resetting mapMessages
			if(!f.isUndefined(mapMessages)){
				throw 'Error should be gone here: Make sure it is otherwise', mapMessages;
			}
			chosenMap.delete();
			bannedMaps.push('\nChosen map is ' + String(chosenMap).split('\n')[1]);
			bot.getMapStatusMessage().edit(getMapString(true)); // TODO Check
		}
	} else if(user.id === captain2.uid && mapVetoTurn === 1){
		var tempMessage = mapMessages[i];
		var presentableName = String(tempMessage).split('\n')[1];
		bannedMaps.push(user.username + ' banned ' + presentableName); // Maybe should add bold on second to last one
		mapMessages.splice(i, 1); // splice(index, howMany)
		tempMessage.delete(400);
		changeTurn();
		if(mapMessages.length === 1){ // We are done and have only one map left
			var chosenMap = mapMessages[0];
			mapMessages = undefined;
			if(!f.isUndefined(mapMessages)){
				throw 'Error: mapMessages should be gone here: Make sure it is otherwise';
			}
			chosenMap.delete();
			bannedMaps.push('Chosen map is ' + String(chosenMap).split('\n')[1]);
			bot.getMapStatusMessage().edit(getMapString(true));
		}
	} else { // Don't allow messageReaction of emoji_error otherwise
		console.log('DEBUG: Not allowed user pressed ' + emoji_error);
		messageReaction.remove(user);
	}
}

var otherMapVote = function(messageReaction, user, activeMembers){
	console.log('DEBUG: not captain vote', user.username);
	var allowed = false; // TODO: Redo with some contains method
	if(f.isUndefined(activeMembers)){
		console.log('Error: activeMembers not initialized in @otherMapVote (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
	}else{
		activeMembers.forEach(function(guildMember){
			console.log('DEBUG: Added reaction of', messageReaction.emoji.id, 'from', user.username, 'on msg :', messageReaction.message.id);
			if(user.id === guildMember.id){
				allowed = true;
			}
		});
	}
	if(!allowed){
		messageReaction.remove(user);
	}
}

async function mapVetoStart(message, balanceInfo, clientEmojis){
	// Get captain from both teams
	captain1 = player_js.getHighestMMR(balanceInfo.team1); // TODO: Check if problem with not being async, moved from function
	captain2 = player_js.getHighestMMR(balanceInfo.team2);
	// Choose who starts (random)
	mapVetoTurn = Math.floor((Math.random() * 2));
	mapMessages = []; 
	var startingCaptainUsername = (mapVetoTurn === 0 ? captain1.userName : captain2.userName); 
	await f.print(message, getMapString(false, startingCaptainUsername), callbackMapHandle); 
	// Get maps. Temp solution:
	// TODO: Database on Map texts, map emojis( and presets of maps, 5v5, 2v2 etc)
	await getMapMessages(message, clientEmojis);
	return mapMessages;
}


function callbackMapHandle(message){
	bot.setMapStatusMessage(message);
}


// Returns promise messages for maps
async function getMapMessages(message, clientEmojis){ // TODO Check Should run asynchrounsly, try setTimeout , 0 otherwise
	initMap('Dust2', clientEmojis, message, callbackMapMessage);
	initMap('Inferno', clientEmojis, message, callbackMapMessage);
	initMap('Mirage', clientEmojis, message, callbackMapMessage);
	initMap('Nuke', clientEmojis, message, callbackMapMessage);
	initMap('Cache', clientEmojis, message, callbackMapMessage);
	initMap('Overpass', clientEmojis, message, callbackMapMessage);
	initMap('Train', clientEmojis, message, callbackMapMessage);
}	
/*
	const map_dust2 = clientEmojis.find("name", "Dust2");
	const map_mirage = clientEmojis.find("name", "Mirage");
	const map_train = clientEmojis.find("name", "Train");
	const map_cache = clientEmojis.find("name", "Cache");
	const map_overpass = clientEmojis.find("name", "Overpass");
	const map_inferno = clientEmojis.find("name", "Inferno");
	const map_nuke = clientEmojis.find("name", "Nuke");
	setTimeout(initMap('Dust2', map_dust2, message, callbackMapMessage), 0); // TODO: Check if faster
	setTimeout(initMap('Inferno', map_inferno, message, callbackMapMessage), 0);
	setTimeout(initMap('Mirage', map_mirage, message, callbackMapMessage), 0);
	setTimeout(initMap('Nuke', map_nuke, message, callbackMapMessage), 0);
	setTimeout(initMap('Cache', map_cache, message, callbackMapMessage), 0);
	setTimeout(initMap('Overpass', map_overpass, message, callbackMapMessage), 0);
	setTimeout(initMap('Train', map_train, message, callbackMapMessage), 0);
*/
// setTimeout(initMap('Train', map_train, message, callbackMapMessage), 0);
// f.print(message, mapEmoji.toString() + mapName + mapEmoji.toString(), callback); <- clientEmojis -> mapEmoji

var longLine = '\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n';

function initMap(mapName, clientEmojis, message, callback){
	const mapEmoji = clientEmojis.find('name', mapName);
	f.print(message, longLine + mapEmoji.toString() + mapName + mapEmoji.toString(), callback); // Move to function so they can start parallell
}

function callbackMapMessage(mapObj){
	mapMessageReact(mapObj);
	mapMessages.push(mapObj);
}

async function mapMessageReact(message){
	await message.react(emoji_error);
	await message.react(emoji_agree);
	message.react(emoji_disagree);
}

var getMapString = function(finished, startingCaptainUsername){ // Allows to be called without third parameter if finished = false
	// Print out instructions
	// TODO: Store long message as some field to create it more easily. First => better name and field
	//console.log('DEBUG: @getMapString', finished, bannedMaps[bannedMaps.length-1]);
	var s = '**Map Veto**\nThe captains **' + captain1.userName + '** and **' + captain2.userName + '** can now vote on which maps to play. \n';
	s += 'Keep banning maps by pressing ' + bot.emoji_error + ' on your turn until there is only one map left. \n\n';
	for(var i = 0; i < bannedMaps.length; i++){
		if(i === bannedMaps.length - 1){
			s += '**' + bannedMaps[i] + '**\n'; // Latest one in bold
		}else{
			s += '*' + bannedMaps[i] + '*\n';			
		}
	}
	if(!finished){
		if(f.isUndefined(startingCaptainUsername)){
			throw 'Error: @getMapString. startingCaptainUsername should never be null';
		}
		s += '\n**' + startingCaptainUsername + 's turn**';	
	}
	return s;
}

// Change turn between captains
var changeTurn = function(){
	mapVetoTurn = 1 - mapVetoTurn; // Flips between 1 and 0
	var startingCaptainUsername = (mapVetoTurn === 0 ? captain1.userName : captain2.userName); 
	bot.getMapStatusMessage().edit(getMapString(false, startingCaptainUsername))
}

module.exports.mapVetoStart = mapVetoStart;

module.exports = {
	captainVote : captainVote,
	otherMapVote : otherMapVote,
	mapVetoStart : mapVetoStart, 
	getMapString : getMapString,
	changeTurn : changeTurn
}