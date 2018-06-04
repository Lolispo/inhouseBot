'use strict';
// Author: Petter Andersson

// Main File for discord bot: Handles event for messages

const Discord = require('discord.js');
const ArrayList = require('arraylist');

// Get Instance of discord client
const client = new Discord.Client();

const balance = require('./balance');					// Balances and starts game between 2 teams
const mmr_js = require('./mmr');						// Handles balanced mmr update
const player_js = require('./player');					// Handles player storage in session, the database in action
const map_js = require('./mapVeto');					// MapVeto system
const voiceMove_js = require('./voiceMove'); 			// Handles moving of users between voiceChannels
const f = require('./f');								// Function class used by many classes, ex. isUndefined, messagesDeletion
const db_sequelize = require('./db-sequelize');			// Handles communication with db
const trivia = require('./trivia')						// Trivia
const { prefix, token, dbpw } = require('./conf.json'); // Load config data from file

/*
	TODO:
		Bug / Crash:
			Trivia fix. Listed below
		Features:
			Trivia
				Exit game
					if exit is called, discord unhandledpromiserejectionwarning. Some deletion tried on something?
					Game wasn't finished, ended with finishmessage of last question and then warning. No end table
				If noone answered anything 5 questions (attempted) in a row, end questions
				2 URL requests are currently happening. Fix. Check if occurs?
					Author of message must be in voice channel fix
				remove
					Noone answered in time msgs remove
					Answered correctly msgs remove
					start msg remove
				require some lock to prevent 2 people getting same answer in at same time?
				Make it known that prefix commands wont work in trivia channel
			Restrict 1v1 gamemodes so they cant be started by > 2 players
				Reflect: Should aim map be affected in what you play? Assumed for 1v1, but what about 2v2?
			Help command generated through command variables instead, match up perfectly
				Should generate readme part directly through this as well
			Handle name lengths for prints in f.js so names are aligned in tabs after longest names
				Find a fix for printing result alignment - redo system with ``
				`` Code blocks could be used for same size on chars, but cant have bold text then (Used on player names?)
				Reference: TODO: Print``
			Support unite to channels with names over one word
		Bigger but Core Features:
			Challenge / Duel: Challenge someone to 1v1
				Challenge specific person or "Queue" so anyone can accept
				If challenged: message that user where user can react to response in dm. Update in channel that match is on
				Default cs1v1, otherwise dota1v1
				Reference TODO: Duel
			Save every field as a Collection{GuildSnowflake -> field variable} to make sure bot works on many servers at once
				Change bot to be instances instead of file methods, reach everything from guildSnowflake then (same logic as player but for bot)
				Reference: TODO: guildSnowFlake
		Refactor:
			Store MMR for more games
				Change into new created tables, ratings etc to have gamesPlayed for all games instead of sharing (only relevant for cs)
				Reference: TODO: RefactorDB
			Fix async/await works
				Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
					Double check places returning promises, to see if they are .then correctly
		Tests:
			Add test method so system can be live without updating db on every match (-balance test or something)
		Deluxe Features (Ideas):
			(Different System for Starting MMR)
				Start MMR chosen as either 2400, 2500 or 2600 depending on own skill, for better distribution in first games, better matchup
				OR
				Add a second hidden rating for each user, so even though they all start at same mmr, 
					this rating is used to even out the teams when unsure (Only between people of same rank)
			(Additions for new channel support / less manual work)
				Custom emojis
					mapVeto emotes, custom upvote/downvote (seemsgood maybe)
				Voice channels for Team split (Team1, Team2)
				Text channel for trivia
			Benefits of running system through node process handler (something):
				Restart in 30 sec when connection terminated due to no internet connection, currently: Unhandled "error" event. Client.emit (events.js:186:19)
				Better handling of removing messages. require('node-cleanup'); code could be run better in f.js
			Alternative MapVeto:
				mapVeto using majority vote instead of captains
			GDPR laws
				Add feature for user to remove themself from databse (should not be used as a reset) = ban from system
		Big ideas:
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

var stage = 0; 			// Current: Stage = 0 -> nothing started yet, default. Stage = 1 -> rdy for: mapVeto/split/team1Won/team2Won/gameNotPlayed.
var balanceInfo; 		// Object: {team1, team2, difference, avgT1, avgT2, avgDiff, game} Initialized on transition between stage 0 and 1. 
var activeMembers; 		// Active members playing (team1 players + team2 players)

var matchupMessage; 	// -b, users made command
var matchupServerMsg; 	// Discord message for showing matchup, members in both teams and mmr difference
var voteMessage;		// When voting on who won, this holds the voteText discord message
var teamWonMessage;		// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
var teamWon;			// Keeps track on which team won
var mapStatusMessage;	// Message that keep track of which maps are banned and whose turn is it

var mapMessages = [];	// Keeps track of the discord messages for the different maps 
var savedTriviaQuestions = []; // TODO: Reuse this if not empty and not used to not waste any questions

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';
const adminUids = ['96293765001519104', '107882667894124544']; // Admin ids, get access to specific admin rights
const removeBotMessageDefaultTime = 60000; // 300000

const balanceCommands = [prefix + 'b', prefix + 'balance', prefix + 'balanceGame', prefix + 'inhousebalance'];
const helpCommands = [prefix + 'h', prefix + 'help'];
const team1wonCommands = [prefix + 'team1won'];
const team2wonCommands = [prefix + 'team2won'];
const tieCommands = [prefix + 'tie', prefix + 'draw'];
const cancelCommands = [prefix + 'c', prefix + 'cancel', prefix + 'gamenotplayed'];
const splitCommands = [prefix + 'split'];
const uniteCommands = [prefix + 'u', prefix + 'unite'];
const uniteAllCommands = [prefix + 'ua', prefix + 'uniteAll'];
const mapvetostartCommands = [prefix + 'mapveto', prefix + 'startmapveto', prefix + 'mapvetostart', prefix + 'startmaps'];
const triviaCommands = [prefix + 'trivia', prefix + 'starttrivia', prefix + 'triviastart'];
const leaderboardCommands = [prefix + 'leaderboard'];
const statsCommands = [prefix + 'stats'];
const exitCommands = [prefix + 'exit'];

// Listener on message
client.on('message', message => {
	if(!message.author.bot && message.author.username !== bot_name){ // Message sent from user
		if(!f.isUndefined(message.channel.guild)){
			message.content = message.content.toLowerCase(); // Allows command to not care about case
			if(message.channel.name === trivia.getChannelName() && trivia.getGameOnGoing()){
				trivia.isCorrect(message);
			} else {
				handleMessage(message);			
			}
		}else{ // Direct Message to Bot
			console.log('DM msg = ' + message.author.username + ': ' + message.content);
			message.author.send('Send commands in a server - not to me!')
			.then(result => {
				f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
			});
			if(helpCommands.includes(message.content)){ // Special case for allowing help messages to show up in DM
				message.author.send(buildHelpString())
				.then(result => {
					f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
				});
			}
			// TODO Allow Stats messages here as well
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
	if(startsWith(message, 'hej')){
		f.print(message, 'Hej ' + message.author.username, noop); // Not removing hej messages
	}
	else if(message.content === prefix + 'ping'){ // Good for testing prefix and connection to bot
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
	else if(helpCommands.includes(message.content)){
		message.author.send(buildHelpString());
		f.deleteDiscMessage(message, 10000, 'help');
	}
	else if(startsWith(message, balanceCommands)){
		if(stage === 0){
			var game = getGameChosen(message);
			matchupMessage = message; // Used globally in print method
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
				var players = findPlayersStart(message, voiceChannel); // initalize players objects with playerInformation
				var numPlayers = players.size();
				if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){ // TODO: Duel Change matchup criterias
					db_sequelize.initializePlayers(players, dbpw, function(playerList){
						balance.balanceTeams(playerList, game);
					}); // Initialize balancing, Result is printed and stage = 1 when done
				} else if((numPlayers === 1 || numPlayers === 2) && (adminUids.includes(message.author.id)) ){
					testBalanceGeneric(game); // TODO: Duel remove numPlayers === 2
				} else{ // TODO: Duel Adjust this error message on allowed sizes, when duel is added
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
	else if(startsWith(message, triviaCommands)){
		var mode = message.content.split(' '); 
		if(mode.length >= 2){
			// Grabs second argument if available
			switch(mode[1]){
				case 'all':
				case '0':
				case 'allsubjectseasy':
					trivia.getDataQuestions(message, 10, 0, 1);
					break;
				case 'anything':
					trivia.getDataQuestions(message, 10, 0);
					break;
				case 'game':
				case 'games':
				case 'gamesall':
				case '1':
					trivia.getDataQuestions(message, 10, 1);
					break;
				case 'gameseasy':
					trivia.getDataQuestions(message, 10, 1, 1);
					break;
				case '2':
				case 'generic':
				case 'genericeasy':
					trivia.getDataQuestions(message, 10, 2, 1);
					break;
				case 'genericall':
					trivia.getDataQuestions(message, 10, 2);
					break;
				default:
					trivia.getDataQuestions(message, 10, 0);
			}
		} else{ // No mode chosen, use default
			trivia.getDataQuestions(message, 10, 0, 1);
		}
		f.deleteDiscMessage(message, 15000, 'trivia');
	}

	// Show top 5 MMR 
	else if(startsWith(message, leaderboardCommands)){
		var game = getGameChosen(message);
		db_sequelize.getHighScore(game, function(data){
			var s = '**Leaderboard Top 5 for ' + game + ':**\n';
			// TODO: Print``
			data.forEach(function(oneData){ // TODO: RefactorDB
				s += oneData.userName + ': \t**' + oneData[game] + ' mmr** \t(Games Played: ' + oneData.gamesPlayed + ')\n';
			});
			f.print(message, s);
		});
		f.deleteDiscMessage(message, 15000, 'leaderboard');
	}
	// Sends private information about your statistics
	else if(startsWith(message, statsCommands)){
		var game = getGameChosen(message);
		db_sequelize.getPersonalStats(message.author.id, game, function(data, game){
			var s = '';
			if(data.length === 0){
				s += "**User doesn't have any games played**";
			}
			else {
				s += '**Your stats for ' + game + ':**\n';
				data.forEach(function(oneData){ // TODO: RefactorDB Either choose options OR show all stats that have gamesPlayed > 0
					s += oneData.userName + ': \t**' + oneData[game] + ' mmr**' + (game === 'cs' ? '\t(Games Played: ' + oneData.gamesPlayed + ')\n' : '');
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
	else if(exitCommands.includes(message.content)){
		if(adminUids.includes(message.author.id)){
			// Do tests:
			cleanupExit();
		}
		f.deleteDiscMessage(message, 1, 'exit');
	}
	// Unites all channels, INDEPENDENT of game ongoing
	// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
	else if(startsWith(message, uniteAllCommands)){
		voiceMove_js.uniteAll(message);
		f.deleteDiscMessage(message, 15000, 'ua');
	}
	// STAGE 1 COMMANDS: (After balance is made)
	else if(stage === 1){
		if(team1wonCommands.includes(message.content)){
			teamWonMessage = message;
			teamWon = 1;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(team1wonCommands.includes(message.content)){
			teamWonMessage = message;
			teamWon = 2;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(tieCommands.includes(message.content)){
			teamWonMessage = message;
			teamWon = 0;
			f.print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')', callbackVoteText);
		}
		else if(cancelCommands.includes(message.content)){
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
		else if(splitCommands.includes(message.content)){
			voiceMove_js.split(message, balanceInfo, activeMembers);
			f.deleteDiscMessage(message, 15000, 'split');
		}
		// Take every user in 'Team1' and 'Team2' and move them to the same voice chat
		// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
		else if(startsWith(message, uniteCommands)){ 
			voiceMove_js.unite(message, activeMembers);
			f.deleteDiscMessage(message, 15000, 'u');
		}

		// mapVeto made between one captain from each team
		else if(mapvetostartCommands.includes(message.content)){
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
// Can also accept command to be array, then if any command in array is start of msg, return true
function startsWith(message, command){
	//console.log('DEBUG @startsWith', command, Array.isArray(command));
	if(Array.isArray(command)){
		for(var i = 0; i < command.length; i++){
			if(message.content.lastIndexOf(command[i], 0) === 0){
				return true;
			}
		}
		return false;
	}else {
		return (message.content.lastIndexOf(command, 0) === 0);	
	}
}

function getGameChosen(message){
	var options = message.content.split(' ');
	var game = 'cs';
	if(options.length === 2){
		if(player_js.getGameModes().includes(options[1]) || player_js.getOtherRatings().includes(options[1])){
			console.log('DEBUG @b Game chosen as: ' + options[1]);
			game = options[1];
		}
	}
	return game;
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
	console.log('DEBUG @triviaStart AM I RUNNING TWICE?', message.content, voiceChannel.id, voiceChannel !== null && !f.isUndefined(voiceChannel));
	if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel TODO: Decide if needed
		var players = findPlayersStart(message, voiceChannel);
		db_sequelize.initializePlayers(players, dbpw, function(playerList){
			trivia.startGame(message, questions, playerList); 
		});
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
function testBalanceGeneric(game){
	console.log('\t<-- Testing Environment: 10 player game, res in console -->');
	var players = new ArrayList;
	for(var i = 0; i < 10; i++){
		var tempPlayer = player_js.createPlayer('Player ' + i, i.toString());
		//console.log('DEBUG: @findPlayersStart, tempPlayer =', tempPlayer);
		players.add(tempPlayer);
	}
	db_sequelize.initializePlayers(players, dbpw, function(playerList){
		balance.balanceTeams(playerList, game);
	}) // Initialize balancing and prints result. Sets stage = 1 when done
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
// TODO: Check if works still after refactor
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

// Handle relevant emoji
function handleRelevantEmoji(emojiConfirm, winner, messageReaction, amountRelevant, totalNeeded){
	//console.log('DEBUG: @handleRelevantEmoji', amountRelevant, totalNeeded, emojiConfirm);
	if(amountRelevant >= totalNeeded){
		if(emojiConfirm){
			console.log(emoji_agree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			mmr_js.updateMMR(winner, balanceInfo, callbackGameFinished); // Update mmr for both teams
			console.log('DEBUG CHECK ME: ARE THE TWO FOLLOWING THE SAME: ', messageReaction.message.content, voteMessage.content); // TODO Check: are these the same
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

// TODO commandHelp: Keep updated with recent information
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

// Used to delete messages if interrupts occur
function onExit(){
	if(!f.isUndefined(mapMessages)){
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

// Here follows callbackFunctions for handling bot sent messages

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

function noop(message){ // callback used when no operation is wanted
	// Doesn't delete the message
}

// Should contain all reset logic to get back to stage 0
function setStage(value){
	stage = value;
	if(value === 0){
		map_js.bannedMaps = [];
	}
}

exports.setStage = function(value){
	setStage(value);
}

exports.printMessage = function(message, callback = noop){ // Default: NOT removing message
	f.print(matchupMessage, message, callback);
}

// TODO: guildSnowFlake for all setters
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