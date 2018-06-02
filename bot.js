'use strict';
// Author: Petter Andersson

// Main File for discord bot: Handles event for messages

const Discord = require('discord.js');
const ArrayList = require('arraylist');

// Get Instance of discord client
const client = new Discord.Client();

const balance = require('./balance');
const mmr_js = require('./mmr');
const player_js = require('./player');
const map_js = require('./mapVeto');
const voiceMove_js = require('./voiceMove'); 
const f = require('./f');
const db_sequelize = require('./db-sequelize');
const trivia = require('./trivia')
//get config data
const { prefix, token, dbpw } = require('./conf.json');

/*
	TODO:
		Features:
			Support unite to channels with names over one word
			Challenge / Duel: Challenge someone to 1v1
				Challenge specific person or "Queue" so anyone can accept
				If challenged: message that user where user can react to response in dm. Update in channel that match is on
				Default cs1v1, otherwise dota1v1
			Store MMR for more games
				Default cs, otherwise dota
				Decide where you specify which mmr (either at balance or at win)
			Save every field as a Collection{GuildSnowflake -> field variable} to make sure bot works on many servers at once
				Change bot to be instances instead of file methods, reach everythging from guildSnowflake thahn
			Start MMR chosen as either 2400, 2500 or 2600 depending on own skill, for better distribution in first games, better matchup
			Find a fix for printing result alignment - redo system for printouts?
				Didn't work, since char diff length: Handle name lengths for prints in f.js so names are aligned in tabs after longest names
		Refactor:
			Fix async/await works
				Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
					Double check places returning promises, to see if they are .then correctly
		Bug / Crash:
			If internet dies, gets unhandled "error" event, Client.emit, on the default case in the onMessage event
				Restart in 30 sec when connection terminated due to no internet connection, currently: Unhandled "error" event. Client.emit (events.js:186:19)
		Tests:
			Add test method so system can be live without updating data base on every match (-balance test or something)
			(QoL) On exit, remove messages that are waiting for be removed (For better testing)
		Reflect:
			Better Printout / message to clients (Currently as message, but not nice looking)
			Better names for commands
		Deluxe Features (Ideas):
			Gör så att botten kan göra custom emojis, och adda de till servern för usage (ex. mapVeto emotes och seemsgood)
			(Connected to StartMMR) 
				Add a second hidden rating for each user, so even though they all start at same mmr, 
					this rating is used to even out the teams when unsure (ONLY BEGINNING)
			mapVeto using majority vote instead of captains
			Add feature for user to remove themself from databse (should not be used as a reset) = ban from system
				GDPR laws

			Twitter deathmatch
			Family Feud
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
var matchupServerMsg; 	// Discord message for showing matchup, members in both teams and mmr difference
var voteMessage;		// When voting on who won, this holds the voteText discord message
var teamWonMessage;		// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
var teamWon;			// Keeps track on which team won
var mapStatusMessage;	// Message that keep track of which maps are banned and whose turn is it

var mapMessages = [];	// Keeps track of the discord messages for the different maps 
var savedTriviaQuestions = [];

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';
const adminUids = ['96293765001519104', '107882667894124544']; // Admin ids, get access to specific admin rights
const removeBotMessageDefaultTime = 60000; // 300000


// Listener on message
client.on('message', message => {
	if(!message.author.bot && message.author.username !== bot_name){ // Message sent from user
		if(!f.isUndefined(message.channel.guild)){
			message.content = message.content.toLowerCase(); // Allows command to not care about case
			if(message.channel.name === trivia.getChannelName() && trivia.getGameOnGoing()){ // TODO: Should you check here if user is an active user? Restrict or allow everyone to play
				// Trivia channel - make a trivia channel chat
				trivia.isCorrect(message);
				// f.deleteDiscMessage(message, removeBotMessageDefaultTime, 'trivia-channel message'); // Add this if messages should be removed from trivia chat
			} else {
				handleMessage(message);			
			}
		}else{ // Someone tried to DM the bot
			console.log('DM msg = ' + message.author.username + ': ' + message.content);
			message.author.send('Send commands in a server - not to me!')
			.then(result => {
				f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
			});
			if(message.content === prefix+'help' || message.content === prefix+'h'){ // Special case for allowing help messages to show up in DM
				message.author.send(buildHelpString())
				.then(result => {
					f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
				});
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
							map_js.captainVote(messageReaction, user, i);
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
	console.log('< MSG (' + message.channel.guild.name + '.' + message.channel.name + ') ' + message.author.username + ':', message.content); 
	// All stages commands, Commands that should always work, from every stage
	if(message.content == 'hej'){
		f.print(message, 'Hej ' + message.author.username, noop); // Not removing hej messages
	}
	else if(message.content === prefix+'ping'){ // Good for testing prefix and connection to bot
		console.log('PingAlert, user had !ping as command');
		f.print(message, 'Pong');
		f.deleteDiscMessage(message, removeBotMessageDefaultTime, 'ping');
	}
	else if(startsWith(message, prefix + 'roll')){ // Roll command for luls
		var messages = message.content.split(' ');
		if(messages.length === 2 && !isNaN(parseInt(messages[1]))){ // Valid input
			roll(message, 0, messages[1])
		}else if(messages.length === 3 && !isNaN(parseInt(messages[1])) && !isNaN(parseInt(messages[2]))){ // Valid input
			roll(message, parseInt(messages[1]), parseInt(messages[2]))
		}else {
			roll(message, 0, 100);
		}
	}
	// Sends available commands privately to the user
	else if(message.content === prefix+'help' || message.content === prefix+'h'){
		message.author.send(buildHelpString());
		f.deleteDiscMessage(message, 10000, 'help');
	}
	else if(message.content === `${prefix}b` || message.content === `${prefix}balance` || message.content === `${prefix}inhousebalance`){
		if(stage === 0){
			matchupMessage = message; // Used globally in print method
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
				var players = findPlayersStart(message, voiceChannel); // initalize players objects with playerInformation
				var numPlayers = players.size();
				if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){ // TODO: Change matchup criterias
					balance.initializePlayers(players, dbpw); // Initialize balancing, Result is printed and stage = 1 when done
				} else if((numPlayers === 1 || numPlayers === 2) && (adminUids.includes(message.author.id)) ){
					testBalanceGeneric(); // TODO: Adjust test to be more relevant, remove numPlayers === 2
				} else{ // TODO: Adjust this error message on allowed sizes, when duel is added
					f.print(message, 'Currently only support even games of 4, 6, 8 and 10 players', callbackInvalidCommand);
				}
			} else {
				f.print(message, 'Invalid command: Author of message must be in voiceChannel', callbackInvalidCommand); 
			}
			f.deleteDiscMessage(message, 10000, 'matchupMessage', function(msg){
				msg.content = '-b <removed>';
			});
		} else{
			f.print(message, 'Invalid command: Inhouse already ongoing', callbackInvalidCommand); 
			f.deleteDiscMessage(message, 10000, 'matchupMessage');
		}
	}
	/*
		Starts a trivia game for the people in voice channel
		getDataQuestions options: 
			(amount, 0, 1)	All categories, easy difficulty
			(amount, 1) 	Games, all difficulties
			(amount, 2, 3)  Generic knowledge questions, hard difficulty
	*/
	else if(startsWith(message, prefix + 'trivia')){
		var mode = message.content.split(' '); 
		if(mode.length >= 2){
			// Grabs second argument if available
			switch(mode[1]){
				case 'game':
				case 'games':
				case '1':
					trivia.getDataQuestions(message, 10, 1);
					break;
				case 'all':
				case '0':
					trivia.getDataQuestions(message, 10, 0, 1);
					break;
				case '2':
				case 'generic':
					trivia.getDataQuestions(message, 10, 2, 1); 
				default:
					trivia.getDataQuestions(message, 10, 0);
			}
		} else{ // No mode chosen, use default
			trivia.getDataQuestions(message, 10, 2, 1);
		}
		f.deleteDiscMessage(message, 15000, 'trivia');
	}

	// Show top 5 MMR 
	else if(message.content === `${prefix}leaderboard`){
		db_sequelize.getHighScore(function(data){
			var s = '**Leaderboard Top 5:**\n';
			data.forEach(function(oneData){ 
				s += oneData.userName + ': \t**' + oneData.mmr + ' mmr** \t(Games Played: ' + oneData.gamesPlayed + ')\n';
			});
			f.print(message, s);
		});
		f.deleteDiscMessage(message, 15000, 'leaderboard');
	}
	// Sends private information about your statistics
	else if(message.content === `${prefix}stats`){
		db_sequelize.getPersonalStats(message.author.id, function(data){
			var s = '';
			if(data.length === 0){
				s += "**User doesn't have any games played**";
			}
			else {
				s += '**Your stats:**\n';
				data.forEach(function(oneData){
					s += oneData.userName + ': \t**' + oneData.mmr + ' mmr** \t(Games Played: ' + oneData.gamesPlayed + ')\n';
				});
			}
			message.author.send(s)  // Private message
			.then(result => {
				f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
			}); 
		});
		f.deleteDiscMessage(message, 15000, 'stats');
	}
	// Used for tests
	else if(message.content === `${prefix}exit`){
		if(adminUids.includes(message.author.id)){
			// Do tests:
			cleanupExit();
		}
		f.deleteDiscMessage(message, 1, 'test');
	}
	// Unites all channels, INDEPENDENT of game ongoing
	// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
	else if(startsWith(message, prefix + 'ua') || startsWith(message, prefix + 'uniteall') ){ // TODO: Not from break room, idle chat
		voiceMove_js.uniteAll(message);
		f.deleteDiscMessage(message, 15000, 'ua');
	}
	// STAGE 1 COMMANDS: (After balance is made)
	else if(stage === 1){
		if(message.content === `${prefix}team1won`){
			teamWonMessage = message;
			teamWon = 1;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}team2won`){
			teamWonMessage = message;
			teamWon = 2;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}tie` || message.content === `${prefix}draw`){
			teamWonMessage = message;
			teamWon = 0;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(message.content === `${prefix}c` || message.content === `${prefix}cancel` || message.content === `${prefix}gamenotplayed`){
			// Only creator of game can cancel it
			if(message.author.id === matchupMessage.author.id){
				setStage(0);
				f.print(message, 'Game canceled', callbackGameCanceled);
				f.deleteDiscMessage(message, 15000, 'c'); // prefix+c
			}else{
				f.print(message, 'Invalid command: Only the person who started the game can cancel it (' + matchupMessage.author.username + ')', callbackInvalidCommand);
			}
		}

		// Splits the players playing into the Voice Channels 'Team1' and 'Team2'
		// TODO: Logic for if these aren't available
		else if(message.content === `${prefix}split`){
			voiceMove_js.split(message, balanceInfo, activeMembers);
			f.deleteDiscMessage(message, 15000, 'split');
		}
		// Take every user in 'Team1' and 'Team2' and move them to the same voice chat
		// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
		else if(startsWith(message, prefix + 'u') || startsWith(message, prefix + 'unite')){ 
			voiceMove_js.unite(message, activeMembers);
			f.deleteDiscMessage(message, 15000, 'u');
		}

		// mapVeto made between one captain from each team
		else if(message.content === `${prefix}mapveto`){
			map_js.mapVetoStart(message, balanceInfo, client.emojis)
			.then(result => {
				mapMessages = result;
			});
			f.deleteDiscMessage(message, 15000, 'mapveto'); // Remove mapVeto text
		}
	}
	else if(startsWith(message,prefix)){ // Message start with prefix
		f.print(message, 'Invalid command: List of available commands at **' + prefix + 'help**', callbackInvalidCommand);
		f.deleteDiscMessage(message, 3000, 'invalidCommand'); // Overlaps delete call from callbackInvalidCommand above^
	}
}

// Returns boolean of if message starts with string
function startsWith(message, string){
	return (message.content.lastIndexOf(string, 0) === 0)
}

async function cleanupExit(){
	await setStage(0); 
	await f.onExitDelete();
	await onExit();
	//console.log('EXITING PROCESS');
	//await process.exit();
}

exports.triviaStart = function(questions, message){
	// Start game in text channel with these questions
	savedTriviaQuestions = questions;
	var voiceChannel = message.guild.member(message.author).voiceChannel;
	if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
		var players = findPlayersStart(message, voiceChannel);
		trivia.startGame(message, questions, players);
	} else{
		f.print(message, 'Invalid command: Author of message must be in voiceChannel', callbackInvalidCommand); 
	}
}

// Roll functionality
function roll(message, start, end){
	var roll = Math.floor((Math.random() * (end-start))) + start;
	if(end === roll && (end-start) > 50){ // Only saves message if diff at least 50
		f.print(message, '**' + message.author.username + ' rolled a ' + roll + ' (' + start + ' - ' + end + ')**', noop);
	}else{
		if(roll > (start + (end-start)/ 2)){ // Majority roll gets bold
			f.print(message, message.author.username + ' rolled a **' + roll + '** (' + start + ' - ' + end + ')');
		} else{
			f.print(message, message.author.username + ' rolled a ' + roll + ' (' + start + ' - ' + end + ')');
		}
	}
	f.deleteDiscMessage(message, 10000, 'roll');
}

// Here follows starting balanced game methods

// Starting balancing of a game for given voice channel
function findPlayersStart(message, channel){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
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
	return players;
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
			console.log('DEBUG CHECK ME: ', messageReaction.message.content, voteMessage.content); // TODO Check: are these the same
			f.deleteDiscMessage(messageReaction.message, 3000, 'voteMessage');
			f.deleteDiscMessage(teamWonMessage, 3000, 'teamWonMessage');
		}else{
			console.log(emoji_disagree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			f.deleteDiscMessage(messageReaction.message, 3000, 'voteMessage');
			f.deleteDiscMessage(teamWonMessage, 3000, 'teamWonMessage');
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

// TODO Perm: Keep updated with recent information
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
	s += '**' + prefix + 'leaderboard** Returns Top 5 MMR holders\n';
	s += '**' + prefix + 'stats** Returns your own rating\n';
	s += '**' + prefix + 'split** Splits voice chat\n';
	s += '**' + prefix + 'u | unite** Unite voice chat after game\n';
	s += '**' + prefix + 'mapVeto** Start map veto\n';
	s += '**' + prefix + 'roll** Rolls a number (0 - 100)\n'
	return s;
}

// Here follows callbackFunctions for handling bot sent messages
// Might throw the warning, Unhandled Promise Rejection, unknown message
function onExit(){
	if(!f.isUndefined(mapMessages)){ // TODO: Probably requires to check to see if content === '' since it seems you can delete message in chat and variable stays
		for(var i = 0; i < mapMessages.length; i++){
			f.deleteDiscMessage(mapMessages[i], 0, 'mapMessage['+i+']');		
		}
	}
	if(!f.isUndefined(mapStatusMessage)){
		f.deleteDiscMessage(mapStatusMessage, 0, 'mapStatusMessage');	
	}
	if(!f.isUndefined(voteMessage)){
		f.deleteDiscMessage(voteMessage, 0, 'voteMessage');
	}
	if(!f.isUndefined(teamWonMessage)){
		f.deleteDiscMessage(teamWonMessage, 0, 'teamWonMessage');
	}
	if(!f.isUndefined(matchupServerMsg)){
		f.deleteDiscMessage(matchupServerMsg, 0, 'matchupServerMsg');
	}
	if(!f.isUndefined(matchupMessage)){
		//console.log('DEBUG matchupMessage onExit', matchupMessage.content);
		f.deleteDiscMessage(matchupMessage, 0, 'matchupMessage');
	}
}

function callbackInvalidCommand(message){
	f.deleteDiscMessage(message, 15000, 'invalidCommand');
	message.react(emoji_error);
}

async function callbackVoteText(message){
	voteMessage = message;
	await message.react(emoji_agree);
	message.react(emoji_disagree);
}

function callbackGameCanceled(message){
	f.deleteDiscMessage(message, 15000, 'gameCanceled');
	onExit();
}

function callbackGameFinished(message){ 
	console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
	f.deleteDiscMessage(message, removeBotMessageDefaultTime * 2, 'gameFinished');
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

exports.setMatchupMsg = function(matchupMsg){
	matchupServerMsg = matchupMsg;
}

exports.getMapStatusMessage = function(){
	return mapStatusMessage;
}

exports.setMapStatusMessage = function(variable){
	mapStatusMessage = variable;
}

exports.getRemoveTime = function(){
	return removeBotMessageDefaultTime;
}