'use strict';

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const ArrayList = require('arraylist');
const balance = require('./balance');
const mmr_js = require('./mmr');
const player_js = require('./player');
const map_js = require('./mapVeto');
const voiceMove_js = require('./voiceMove'); 
const f = require('./f');
const db_sequelize = require('./db-sequelize');

//get config data
const { prefix, token, dbpw } = require('./conf.json');

/*
	TODO:
		Features:
			Start MMR chosen as either 2400, 2500 or 2600 depending on own skill, for better distribution in first games, better matchup
			Save every field as a Collection{GuildSnowflake -> field variable} to make sure bot works on many servers at once
			Find a fix for printing result alignment - redo system for printouts?
				Didn't work, since char diff length: Handle name lengths for prints in f.js so names are aligned in tabs after longest names
		Refactor:
			Fix async/await works
				Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
					Double check places returning promises, to see if they are .then correctly
				Handle all bot sent messages with .then on send instead of looking at a received message, handle the send promise instead
					Regroup it and use async/await instead
		Bug / Crash:
			If internet dies, gets unhandled "error" event, Client.emit, on the default case in the onMessage event
				Restart in 30 sec when connection terminated due to no internet connection, currently: Unhandled "error" event. Client.emit (events.js:186:19)
		Tests:
			Add test method so system can be live without updating data base on every match (-balance test or something)
			(QoL) On exit, remove messages that are waiting for be removed (For better testing)
		Reflect:
			Better Printout / message to clients (Currently as message, but not nice looking) (Deluxe: maybe image if possible)
			Better names for commands
		Deluxe Features (Ideas):
			Gör så att botten kan göra custom emojis, och adda de till servern för usage (ex. mapVeto emotes och seemsgood)
			(Connected to StartMMR) 
				Add a second hidden rating for each user, so even though they all start at same mmr, 
					this rating is used to even out the teams when unsure (ONLY BEGINNING)
			mapVeto using majority vote instead of captains
*/

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
	db_sequelize.initDb(dbpw); // Initialize db-sequelize database on startup of bot
});

// Login
client.login(token);

// Current: Stage = 0 -> nothing started yet, default. Stage = 1 -> rdy for: mapVeto/split/team1Won/team2Won/gameNotPlayed.
var stage = 0; 

// TODO: 	Should have a balanceInfo instance available for every server. Collection{GuildSnowflake -> balanceInfo} or something
// 			Should also change in setBalanceInfo to send guild snowflake
var balanceInfo; 		// Object: {team1, team2, difference, avgT1, avgT2, avgDiff} Initialized on transition between stage 0 and 1. 

var activeMembers; 		// Active members playing (team1 players + team2 players)

var matchupMessage; 	// -b, users made command
var matchupServerMsg; // Discord message for showing matchup, members in both teams and mmr difference
var voteMessage;		// When voting on who won, this holds the voteText discord message
var teamWonMessage;		// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
var teamWon;			// Keeps track on which team won
var mapStatusMessage;	// Message that keep track of which maps are banned and whose turn is it
var splitChannel;		// Channel we split in latest

var mapMessages = [];	// Keeps track of the discord messages for the different maps 

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';

const removeBotMessageDefaultTime = 60000; // 300000


// Listener on message
client.on('message', message => {
	if(!message.author.bot && message.author.username !== bot_name){ // Message sent from user
		if(!f.isUndefined(message.channel.guild)){
			handleMessage(message);
		}else{ // Someone tried to DM the bot
			console.log('DM msg = ' + message.author.username + ': ' + message.content);
			message.author.send('Send commands in a server - not to me!');
			if(message.content === prefix+'help' || message.content === prefix+'h'){ // Special case for allowing help messages to show up in DM
				message.author.send(buildHelpString());
				message.delete(10000);
			}
		}
	} // Should handle every message except bot messages
});

// Listener on reactions added to messages
client.on('messageReactionAdd', (messageReaction, user) => {
	if(!user.bot){ // Bot adding reacts doesn't require our care
		if(stage === 1){
			// Reacted on voteMessage
			//console.log('DEBUG: @messageReactionAdd by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
			if(!f.isUndefined(voteMessage) && messageReaction.message.id === voteMessage.id){ // Check if emojiReaction is on voteMessage, voteMessage != undefined
				voteMessageReaction(messageReaction);
			} else if(!f.isUndefined(mapMessages)){
				for(var i = 0; i < mapMessages.length; i++){
					if(messageReaction.message.id === mapMessages[i].id){ // Find if reacted on this map
						if(messageReaction.emoji.toString() === emoji_error){
							map_js.captainVote(messageReaction, user, i, mapStatusMessage);
						} else if(messageReaction.emoji.toString() === emoji_agree){ // If not captains, can only react with emoji_agree or emoji_disagree
							map_js.otherMapVote(messageReaction, user, activeMembers);
						} else if(messageReaction.emoji.toString() === emoji_disagree){ // If not captains, can only react with emoji_agree or emoji_disagree
							map_js.otherMapVote(messageReaction, user, activeMembers);
						}
						break; // Don't continue in the loop for this event, only one map can be reacted to in one event
					}
				}
			}
			// React on something else
		}
	}
});

// Listener on reactions removed from messages
client.on('messageReactionRemove', (messageReaction, user) => {
	if(!user.bot){
		if(stage === 1){
			// React removed on voteMessage
			//console.log('DEBUG: @messageReactionRemove by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
			if(!f.isUndefined(voteMessage) && messageReaction.message.id === voteMessage.id && messageReaction.emoji.toString() === emoji_agree){ // Check if emojiReaction is on voteMessage
				voteMessageTextUpdate(messageReaction);
			}
			// React removed on something else
		}
	}
});

// Create more events to do fancy stuff with discord API

// Main message handling function 
function handleMessage(message) { 
	console.log('MSG (' + message.channel.guild.name + '.' + message.channel.name + ') ' + message.author.username + ':', message.content); 
	// All stages commands, Commands that should always work, from every stage
	if(message.content == 'hej'){
		f.print(message, 'Hej ' + message.author.username, noop); // Not removing hej messages
	}
	else if(message.content === prefix+'ping'){ // Good for testing prefix and connection to bot
		console.log('PingAlert, user had !ping as command');
		f.print(message, 'Pong');
		message.delete(removeBotMessageDefaultTime);
	}
	// Sends available commands privately to the user
	else if(message.content === prefix+'help' || message.content === prefix+'h'){
		message.author.send(buildHelpString());
		message.delete(10000);
	}
	else if(message.content === `${prefix}b` || message.content === `${prefix}balance` || message.content === `${prefix}inhouseBalance`){
		if(stage === 0){
			matchupMessage = message; // Used globally in print method
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
				findPlayersStart(message, voiceChannel);
			} else {
				f.print(message, 'Invalid command: Author of message must be in voiceChannel', callbackInvalidCommand); 
			}
			message.delete(10000); // Is matchupMessage separated from this? Not removed by reference delete TODO: Check
		} else{
			f.print(message, 'Invalid command: Inhouse already ongoing', callbackInvalidCommand); 
			message.delete(10000);
		}
	}

	// Show top 5 MMR 
	else if(message.content === `${prefix}leaderboard` || message.content === `${prefix}leaderBoard`){
		db_sequelize.getHighScore(function(data){
			var s = '**Leaderboard Top 5:**\n';
			data.forEach(function(oneData){ 
				s += oneData.userName + ': \t**' + oneData.mmr + ' mmr** \t(Games Played: ' + oneData.gamesPlayed + ')\n';
			});
			f.print(message, s);
		});
		message.delete(15000);
	}
	// Sends private information about your statistics
	else if(message.content === `${prefix}stats`){ 
		db_sequelize.getPersonalStats(message.author.id, function(data){
			var s = '**Your stats:**\n';
			data.forEach(function(oneData){ 
				s += oneData.userName + ': \t**' + oneData.mmr + ' mmr** \t(Games Played: ' + oneData.gamesPlayed + ')\n';
			});
			message.author.send(s)  // Private message
			.then(result => {
				result.delete(removeBotMessageDefaultTime * 2);
			}); 
		});
		message.delete(15000);
	}
	// Used for tests
	else if(message.content === `${prefix}test`){
		if(message.author.username === 'Petter'){
			// Do tests: 
		}
		message.delete(1000);
	}
	// TODO: Unites all channels, INDEPENDENT of game ongoing
	// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
	else if(startsWith(message, prefix + 'ua') || startsWith(message, prefix + 'uniteAll') ){ // TODO: Not from break room, idle chat
		voiceMove_js.uniteAll(message);
		message.delete(15000);
	}
	// STAGE 1 COMMANDS: (After balance is made)
	else if(stage === 1){
		if(message.content === `${prefix}team1Won`){
			teamWonMessage = message;
			teamWon = 1;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}team2Won`){
			teamWonMessage = message;
			teamWon = 2;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}tie` || message.content === `${prefix}draw`){
			teamWonMessage = message;
			teamWon = 0;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}c` || message.content === `${prefix}cancel` || message.content === `${prefix}gameNotPlayed`){
			// Only creator of game can cancel it
			if(message.author.id === matchupMessage.author.id){
				setStage(0);
				f.print(message, 'Game canceled', callbackGameCanceled);
				message.delete(15000); // prefix+c
			}else{
				f.print(message, 'Invalid command: Only the person who started the game can cancel it (' + matchupMessage.author.username + ')', callbackInvalidCommand);
			}
		}

		// Splits the players playing into the Voice Channels 'Team1' and 'Team2'
		// TODO: Logic for if these aren't available
		else if(message.content === `${prefix}split`){
			voiceMove_js.split(message, balanceInfo, activeMembers);
			message.delete(15000);
		}
		// Take every user in 'Team1' and 'Team2' and move them to the same voice chat
		// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
		else if(startsWith(message, prefix + 'u') || startsWith(message, prefix + 'unite')){ 
			voiceMove_js.unite(message, activeMembers);
			message.delete(15000);
		}

		// mapVeto made between one captain from each team
		else if(message.content === `${prefix}mapVeto`){
			map_js.mapVetoStart(message, balanceInfo, client.emojis)
			.then(result => {
				mapMessages = result;
			});
			message.delete(15000); // Remove mapVeto text
		}
	}
	else if(startsWith(message,prefix)){ // Message start with prefix
		f.print(message, 'Invalid command: List of available commands at **' + prefix + 'help**', callbackInvalidCommand);
		message.delete(3000);
	}
}

// Returns boolean of if message starts with string
function startsWith(message, string){
	return (message.content.lastIndexOf(string, 0) === 0)
}

// Here follows starting balanced game methods

// Starting balancing of a game for given voice channel
function findPlayersStart(message, channel){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
	var numPlayers = channel.members.size
	if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){
		// initalize 10 Player objects with playerInformation
		var players = new ArrayList;
		activeMembers = Array.from(channel.members.values());
		//console.log('DEBUG: Channel', channel.members);
		activeMembers.forEach(function(member){
			if(!member.bot){ // Only real users
				console.log('\t' + member.user.username + '(' + member.user.id + ')'); // Printar alla activa users i denna voice chatt
				var tempPlayer = player_js.createPlayer(member.user.username, member.user.id);
				players.add(tempPlayer);
			}
		});
		balance.initializePlayers(players, dbpw); // Initialize balancing, Result is printed and stage = 1 when done
	} else if((numPlayers === 1 || numPlayers === 2) && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
		testBalanceGeneric();
	} else{
		f.print(message, 'Currently only support even games of 4, 6, 8 and 10 players', callbackInvalidCommand);
	}
}

// A Test for balancing and getting to stage 1 without players available
function testBalanceGeneric(){
	console.log('\t<-- Testing Environment: 10 player game, res in console -->');
	var players = new ArrayList;
	for(var i = 0; i < 10; i++){
		var tempPlayer = player_js.createPlayer('Player ' + i, i.toString());
		//console.log('DEBUG: @findPlayersStart, tempPlayer =', tempPlayer);
		players.add(tempPlayer);
	}
	balance.initializePlayers(players, dbpw); // Initialize balancing and prints result. Sets stage = 1 when done
}

// Handling of voteMessageReactions
function voteMessageReaction(messageReaction){
	// Check if majority number contain enough players playing
	if(messageReaction.emoji.toString() === emoji_agree){
		voteMessageTextUpdate(messageReaction)
		.then(result => {
			handleRelevantEmoji(true, teamWon, messageReaction, result.amountRelevant, result.totalNeeded);	
		});
	}else if(messageReaction.emoji.toString() === emoji_disagree){
		var amountRelevant = countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
		var totalNeeded = (balanceInfo.team1.size() + 1);
		handleRelevantEmoji(false, teamWon, messageReaction, amountRelevant, totalNeeded);
	}
}

// Updates voteMessage on like / unlike the agree emoji
// Is async to await the voteMessage.edit promise
// TODO: Check if works still after refactor. RETURNS A PROMISE. Voting still works it seems
async function voteMessageTextUpdate(messageReaction){
	var amountRel = await countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
	var totalNeed = await (balanceInfo.team1.size() + 1);
	//console.log('DEBUG: @messageReactionAdd, count =', amountRelevant, ', Majority number is =', totalNeeded);
	var voteAmountString = ' (' + amountRel + '/' + totalNeed + ')';
	var newVoteMessage = (voteText + voteAmountString);
	voteMessage.content = newVoteMessage; // Not needed if await on edit? TODO: Check
	await voteMessage.edit(newVoteMessage);
	return {amountRelevant: amountRel, totalNeeded: totalNeed}
}

// Handle relevant emoji todo: write me
function handleRelevantEmoji(emojiConfirm, winner, messageReaction, amountRelevant, totalNeeded){
	//console.log('DEBUG: @handleRelevantEmoji', amountRelevant, totalNeeded, emojiConfirm);
	if(amountRelevant >= totalNeeded){
		if(emojiConfirm){
			console.log(emoji_agree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			mmr_js.updateMMR(winner, balanceInfo, callbackGameFinished); // Update mmr for both teams
			messageReaction.message.delete(3000);
			teamWonMessage.delete(3000);
		}else{
			console.log(emoji_disagree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			messageReaction.message.delete(3000);
			teamWonMessage.delete(3000);
		}
	}
}

// Count amount of people who reacted that are part of this team
function countAmountUsersPlaying(team, peopleWhoReacted){ 
	var counter = 0;
	//console.log('DEBUG: @countAmountUsersPlaying', team, peopleWhoReacted);
	peopleWhoReacted.forEach(function(user){
		for(var i = 0; i < team.size(); i++){
			if(user.id === team[i].uid){ // If person who reacted is in the game
				counter++;
			}
		}
	});
	return counter;
}

// TODO: Keep updated with recent information
function buildHelpString(){
	var s = '*Available commands for ' + bot_name + ':* \n';
	s += '**' + prefix + 'ping** *Pong*\n';
	s += '**' + prefix + 'b | balance | inhouseBalance** Starts an inhouse game with the players in the same voice chat as the message author. '
		+ 'Requires 4, 6, 8 or 10 players in voice chat to work\n';
	s += '**' + prefix + 'team1Won | ' + prefix + 'team2Won** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. '
		+ 'If majority of players downvote, this match result report dissapears, use **' + prefix + 'cancel** for canceling the match after this\n';
	s += '**' + prefix + 'draw | tie** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n';
	s += '**' + prefix + 'c | cancel** Cancels the game, to be used when game was decided to not be played\n';
	s += '**' + prefix + 'h | help** Shows the available commands\n';
	s += '**' + prefix + 'leaderboard** Returns Top 3 MMR holders\n';
	s += '**' + prefix + 'stats** Returns your own rating\n';
	s += '**' + prefix + 'split** Splits voice chat\n';
	s += '**' + prefix + 'u | unite** Unite voice chat after game\n';
	s += '**' + prefix + 'mapVeto** Start map veto\n';
	return s;
}

// Here follows callbackFunctions for handling bot sent messages
// Might throw the warning, Unhandled Promise Rejection, unknown message
function onExit(){
	console.log('DEBUG @onExit Entry- Attempting to delete a bunch of messages')
	if(!f.isUndefined(mapMessages)){ // TODO: Probably requires to check to see if content === '' since it seems you can delete message in chat and variable stays
		console.log('DEBUG @onExit 1');
		for(var i = 0; i < mapMessages.length; i++){
			mapMessages[i].delete()
			.catch(err => console.log(err)); 			
		}
	}
	if(!f.isUndefined(mapStatusMessage)){
		console.log('DEBUG @onExit 2');
		mapStatusMessage.delete()
		.catch(err => console.log(err)); 
	}
	if(!f.isUndefined(voteMessage)){
		console.log('DEBUG @onExit 3');
		voteMessage.delete()
		.catch(err => console.log(err));
	}
	if(!f.isUndefined(teamWonMessage)){
		console.log('DEBUG @onExit 4');
		teamWonMessage.delete()
		.catch(err => console.log(err));
	}
	if(!f.isUndefined(matchupServerMsg)){
		console.log('DEBUG @onExit 5');
		matchupServerMsg.delete()
		.catch(err => console.log(err)); 
	}
	if(!f.isUndefined(matchupMessage)){
		console.log('DEBUG @onExit 6 - should be last');
		matchupMessage.delete()
		.catch(err => console.log(err)); // Delete message immediately on game cancel TODO: Fix Promise rejection
	}
}

function callbackInvalidCommand(message){
	message.delete(15000)
	.catch(err => console.log(err));
	message.react(emoji_error);
}

async function callbackVoteText(message){
	voteMessage = message;
	await message.react(emoji_agree);
	message.react(emoji_disagree);
}

function callbackGameCanceled(message){
	message.delete(15000)
	.catch(err => console.log(err));
	onExit();
}

function callbackGameFinished(message){ 
	console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
	message.delete(removeBotMessageDefaultTime * 2)
	.catch(err => console.log(err));
	onExit();
}

function noop(message){ // callback used for noop
	// Doesn't delete the message
}

// TODO: Move all reset logic here to get stage 0
function setStage(value){
	stage = value;
	if(value === 0){
		map_js.bannedMaps = [];
	}
}


// TODO: Maybe add setResult/MatchupMessage functionality into this, depending on stage
exports.setStage = function(value){
	setStage(value);
}

exports.printMessage = function(message, callback = noop){ // DEFAULT: NOT removing message
	f.print(matchupMessage, message, callback);
}

exports.setBalanceInfo = function(obj){
	balanceInfo = obj;
}

exports.getRemoveTime = function(){
	return removeBotMessageDefaultTime;
}