'use strict';
// Author: Petter Andersson

// Handles map veto system, to choose maps between teams

const bot = require('./bot');
const player_js = require('./game/player');
const f = require('./tools/f');
const { configureServer } = require('./csserver/csserver');
const { promises } = require('fs');

let mapMessagesBuilder = [];

const emoji_agree = '👍'; 		// Agree emoji. Alt: 👍👌, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';
const longLine = '\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n';

var captainVote = function(messageReaction, user, mapMessage, gameObject){
	console.log('DEBUG: CaptainVote', user.username, 'turn = ', gameObject.getMapVetoTurn());
	if(user.id === gameObject.getCaptain1().uid && gameObject.getMapVetoTurn() === 0){ // Check to see if author is a captain and his turn // Crash
		handleCaptainMessage(user, mapMessage, gameObject);
	} else if(user.id === gameObject.getCaptain2().uid && gameObject.getMapVetoTurn() === 1){
		handleCaptainMessage(user, mapMessage, gameObject);
	} else { // Don't allow messageReaction of emoji_error otherwise
		console.log('DEBUG: Not allowed user ' + user.username +' pressed ' + emoji_error + ' (X, requires captain)');
		messageReaction.remove(user);
	}
}

function handleCaptainMessage(user, mapMessage, gameObject){
	var tempMessage = mapMessage; 
	var presentableName = String(tempMessage).split('\n')[1];
	gameObject.getBannedMaps().push(user.username + ' banned ' + presentableName); // Maybe should add bold on second to last one
	var gameMapMessages = gameObject.getMapMessages();
	const index = gameMapMessages.indexOf(mapMessage);
	console.log('Removing', index, mapMessage.content)
	if (index > -1) {
  		gameMapMessages.splice(index, 1);
		/*
		console.log('@handleCaptainMessage size = ', gameMapMessages.length);
		console.log('Updated Maps: ')
		for(let i = 0; i < mapMessagesBuilder.length; i++) {
			console.log('\t',i,mapMessagesBuilder[i].content);
		}*/
		// gameMapMessages.splice(mapMessage, 1); // splice(index, howMany)
		tempMessage.delete(400); // Delete message in 400ms
		changeTurn(gameObject);
		if(gameMapMessages.length === 1){ // We are done and have only one map left
			var chosenMap = gameMapMessages[0];
			gameMapMessages = []; // TODO: Alternative way of init mapMessages? undefined = ugly
			chosenMap.delete();
			const chosenMapString = String(chosenMap).split('\n')[1];
			gameObject.getBannedMaps().push('\nChosen map is ' + chosenMapString);
			gameObject.getMapStatusMessage().edit(getMapString(true, gameObject)); // TODO Check
			gameObject.chosenMap = chosenMapString;
			configureServer(gameObject); // Start in
		}
	} else {
		console.log('MESSAGE NOT FOUND');
		for(let i = 0; i < mapMessagesBuilder.length; i++) {
			console.log('\t',i,mapMessagesBuilder[i].content);
		}
	}
}

var otherMapVote = function(messageReaction, user, activeMembers){
	console.log('DEBUG: Upvote/Downvote Reaction by', user.username);
	var allowed = false;
	allowed = activeMembers.some(function(guildMember){
		console.log('DEBUG: Added reaction of', messageReaction.emoji.name, 'from', user.username, 'on msg :', messageReaction.message.id);
		return user.id === guildMember.id;
	});
	if(!allowed){
		messageReaction.remove(user);
	}
}

let currentMapVetoGameObject;

async function mapVetoStart(message, gameObject, clientEmojis){
	// Get captain from both teams
	currentMapVetoGameObject = gameObject;
	var balanceInfo = gameObject.getBalanceInfo();
	gameObject.setCaptain1(player_js.getHighestMMR(balanceInfo.team1, 'cs'));
	gameObject.setCaptain2(player_js.getHighestMMR(balanceInfo.team2, 'cs'));
	// Choose who starts (random)
	gameObject.setMapVetoTurn(Math.floor((Math.random() * 2)));
	mapMessagesBuilder = []; 
	var startingCaptainUsername = (gameObject.getMapVetoTurn() === 0 ? gameObject.getCaptain1().userName : gameObject.getCaptain2().userName); 
	await f.print(message, getMapString(false, gameObject, startingCaptainUsername), function(message){
		gameObject.setMapStatusMessage(message); // Set message that updates info on maps banned
	}); 
	// Get maps. Temp solution:
	// TODO: Database on Map texts, map emojis and presets of maps, 5v5, 2v2 etc)
	await getMapMessages(message, clientEmojis);
	// return mapMessagesBuilder;
}

// Create map messages, add default reactions and add them to mapMessageBuilder
const getMapMessages = async (message, clientEmojis) => { // TODO Check Should run asynchrounsly, try setTimeout , 0 otherwise
	const mapvetoMessages = [];
	mapvetoMessages.push(initMap('Dust2', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Inferno', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Mirage', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Nuke', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Cache', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Overpass', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Train', clientEmojis, message, callbackMapMessage));
	mapvetoMessages.push(initMap('Vertigo', clientEmojis, message, callbackMapMessage));
	await Promise.all(mapvetoMessages);
}	


function initMap(mapName, clientEmojis, message, callback){
	const mapEmoji = clientEmojis.find('name', mapName);
	f.print(message, longLine + mapEmoji.toString() + mapName + mapEmoji.toString(), callback); // Move to function so they can start parallell
}

function callbackMapMessage(mapObj){
	mapMessageReact(mapObj);
	mapMessagesBuilder.push(mapObj);
	if(mapMessagesBuilder.length === 7){
		currentMapVetoGameObject.setMapMessages(mapMessagesBuilder);
		/*
		console.log('MapMessages');
		for(let i = 0; i < mapMessagesBuilder.length; i++) {
			console.log('\t',i,mapMessagesBuilder[i].content);
		}
		console.log('HELLO Initialized messages: ', mapMessagesBuilder.length);
		*/
	}
}

async function mapMessageReact(message){
	await message.react(emoji_error);
	await message.react(emoji_agree);
	message.react(emoji_disagree);
}

var getMapString = function(finished, gameObject, startingCaptainUsername){ // Allows to be called without third parameter if finished = false
	// Print out instructions
	// TODO: Store long message as some field to create it more easily. First => better name and field
	//console.log('DEBUG: @getMapString', finished, bannedMaps[bannedMaps.length-1]);
	var s = '**Map Veto**\nThe captains **' + gameObject.getCaptain1().userName + '** and **' + gameObject.getCaptain2().userName + '** can now vote on which maps to play. \n';
	s += 'Keep banning maps by pressing ' + emoji_error + ' on your turn until there is only one map left. \n\n';
	var bannedMaps = gameObject.getBannedMaps();
	for(var i = 0; i < bannedMaps.length; i++){
		if(i === bannedMaps.length - 1){
			s += '**' + bannedMaps[i] + '**\n'; // Latest one in bold
		}else{
			s += '*' + bannedMaps[i] + '*\n';			
		}
	}
	if(!finished){
		if(f.isUndefined(startingCaptainUsername)){
			throw 'Error: @getMapString. startingCaptainUsername should not be null (only last case)';
		} else {
			s += '\n**' + startingCaptainUsername + 's turn**';	
		}
	}
	return s;
}

// Change turn between captains
var changeTurn = function(gameObject){
	gameObject.setMapVetoTurn(1 - gameObject.getMapVetoTurn()); // Flips between 1 and 0
	var startingCaptainUsername = (gameObject.getMapVetoTurn() === 0 ? gameObject.getCaptain1().userName : gameObject.getCaptain2().userName); 
	gameObject.getMapStatusMessage().edit(getMapString(false, gameObject, startingCaptainUsername))
}

module.exports.mapVetoStart = mapVetoStart;

module.exports = {
	captainVote : captainVote,
	otherMapVote : otherMapVote,
	mapVetoStart : mapVetoStart, 
	getMapString : getMapString,
	changeTurn : changeTurn
}