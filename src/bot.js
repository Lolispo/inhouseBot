'use strict';
// Author: Petter Andersson

// Main File for discord bot: Handles event for messages

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const f = require('./f');								// Function class used by many classes, ex. isUndefined, messagesDeletion
const balance = require('./balance');					// Balances and starts game between 2 teams
const mmr_js = require('./mmr');						// Handles balanced mmr update
const player_js = require('./player');					// Handles player storage in session, the database in action
const map_js = require('./mapVeto');					// MapVeto system
const voiceMove_js = require('./voiceMove'); 			// Handles moving of users between voiceChannels
const db_sequelize = require('./db-sequelize');			// Handles communication with db
const trivia = require('./trivia')						// Trivia
const game_js = require('./game')

const { prefix, token, db } = require('../conf.json'); // Load config data from file

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
	db_sequelize.initDb(db.database, db.user, db.dbpw, db.host, db.dialect); // Initialize db-sequelize database on startup of bot
});

// Login
client.login(token);

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';
const adminUids = ['96293765001519104', '107882667894124544']; // Admin ids, get access to specific admin rights
const lukasIP = 'connect tywin.dathost.net:28795; password secret';
const removeBotMessageDefaultTime = 60000; // 300000
const maxPlayers = 14;

const helpCommands = [prefix + 'h', prefix + 'help'];
const helpAllCommands = [prefix + 'ha', prefix + 'helpall'];
const balanceCommands = [prefix + 'b', prefix + 'balance', prefix + 'balancegame', prefix + 'inhousebalance'];
const team1wonCommands = [prefix + 'team1won'];
const team2wonCommands = [prefix + 'team2won'];
const tieCommands = [prefix + 'tie', prefix + 'draw'];
const cancelCommands = [prefix + 'c', prefix + 'cancel', prefix + 'gamenotplayed'];
const splitCommands = [prefix + 'split'];
const uniteCommands = [prefix + 'u', prefix + 'unite'];
const uniteAllCommands = [prefix + 'ua', prefix + 'uniteall'];
const mapvetostartCommands = [prefix + 'mapveto', prefix + 'startmapveto', prefix + 'mapvetostart', prefix + 'startmaps'];
const triviaCommands = [prefix + 'trivia', prefix + 'starttrivia', prefix + 'triviastart'];
const triviaModesCommands = [prefix + 'modestrivia', prefix + 'helptrivia'];
const leaderboardCommands = [prefix + 'leaderboard'];
const statsCommands = [prefix + 'stats'];
const exitCommands = [prefix + 'exit', prefix + 'clear', prefix + 'e'];
const duelCommands = [prefix + 'duel'];
const challengeCommands = [prefix + 'challenge'];
const queueCommands = [prefix + 'soloqueue', prefix + 'queue'];
const lennyCommands = ['lenny', 'lennyface', prefix + 'lenny', prefix + 'lennyface'];
const lukasServerCommands = [prefix + 'lukasserver', prefix + 'praccserver', prefix + 'server'];

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
			// Help and stats commands are allowed
			if(helpCommands.includes(message.content)){
				message.author.send(buildHelpString(message.author.id, 0))
				.then(result => {
					f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
				});
			} else if(helpAllCommands.includes(message.content)){
				// TODO: Find a better way to update readme
				//console.log(buildHelpString(message.author.id, 1) + '\n' + buildHelpString(message.author.id, 2)); // Used to update readme
				message.author.send(buildHelpString(message.author.id, 1))
				.then(result => {
					f.deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
				});
				message.author.send(buildHelpString(message.author.id, 2))
				.then(result => {
					f.deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
				});
			} else if(startsWith(message, statsCommands)){
				stats(message);		
			} else{
				message.author.send('Send commands in a server - not to me!\nAllowed command here are: **[' + helpCommands + ',' + helpAllCommands + ',' + statsCommands + ']**\n')
				.then(result => {
					f.deleteDiscMessage(result, 10000, 'sendDMMessage');
				});
			}
		}
	} // Should handle every message except bot messages
});

// Listener on reactions added to messages
client.on('messageReactionAdd', (messageReaction, user) => {
	if(!user.bot){ // Bot adding reacts doesn't require our care
		if(game_js.hasActiveGames()){
			// Reacted on voteMessage
			//console.log('DEBUG: @messageReactionAdd by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
			var gameObject = game_js.getGame(user);
			// Check if emojiReaction is on voteMessage, voteMessage != undefined
			if(!f.isUndefined(gameObject) && !f.isUndefined(gameObject.getVoteMessage()) && messageReaction.message.id === gameObject.getVoteMessage().id){
				voteMessageReaction(messageReaction, gameObject);
			} else { // TODO Game: Check 
				var gameObjectMapMessage = game_js.getGameMapMessages(messageReaction);
				if(!f.isUndefined(gameObjectMapMessage)){ // Reacted on a messageReaction
					
					var mapMessage = gameObject.getMapMessages().find(function(mapMsg){
						return messageReaction.message.id === mapMsg.id
					});

					if(messageReaction.emoji.toString() === emoji_error){
						map_js.captainVote(messageReaction, user, mapMessage, gameObject);
					} else if(messageReaction.emoji.toString() === emoji_agree){ // If not captains, can only react with emoji_agree or emoji_disagree
						map_js.otherMapVote(messageReaction, user, gameObjectMapMessage.getActiveMembers());
					} else if(messageReaction.emoji.toString() === emoji_disagree){ // If not captains, can only react with emoji_agree or emoji_disagree
						map_js.otherMapVote(messageReaction, user, gameObjectMapMessage.getActiveMembers());
					}
				}
				// React on something on an active game
			}
		}
		// React on something not connected to activeGames
	}
});

// Listener on reactions removed from messages
client.on('messageReactionRemove', (messageReaction, user) => {
	if(!user.bot){
		if(game_js.hasActiveGames()){
			// React removed on voteMessage
			//console.log('DEBUG: @messageReactionRemove by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
			var gameObject = game_js.getGame(user);
			// Check if emojiReaction is on voteMessage, voteMessage != undefined
			if(!f.isUndefined(gameObject) && !f.isUndefined(gameObject.getVoteMessage()) && messageReaction.message.id === gameObject.getVoteMessage().id){
				voteMessageTextUpdate(messageReaction);
			}
			// React removed on something else
		}
	}
});

client.on('error', console.error);

// Create more events to do fancy stuff with discord API

// Main message handling function 
function handleMessage(message) { 
	console.log('< MSG (' + message.channel.guild.name + '.' + message.channel.name + ') ' + message.author.username + ':', message.content); 
	// All stages commands, Commands that should always work, from every stage
	if(startsWith(message, 'hej')){
		f.print(message, 'Hej ' + message.author.username, noop); // Not removing hej messages
	}
	else if(lennyCommands.includes(message.content)){
		f.print(message, '( ͡° ͜ʖ ͡°)');
		f.deleteDiscMessage(message, 15000, 'lenny');
	}
	else if(!startsWith(message, prefix)){ // Every command after here need to start with prefix
		return;
	}
	else if(message.content === prefix + 'ping'){ // Good for testing prefix and connection to bot
		console.log('PingAlert, user had !ping as command', client.pings);
		f.print(message, 'Time of response ' + client.pings[0] + ' ms');
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
	else if(lukasServerCommands.includes(message.content)){
		f.print(message, '**' + lukasIP + '**');
		f.deleteDiscMessage(message, 15000, 'lukasServer');
	}
	// Sends available commands privately to the user
	else if(helpCommands.includes(message.content)){
		message.author.send(buildHelpString(message.author.id, 0))
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
		});
		f.deleteDiscMessage(message, 10000, 'help');
	}
	else if(helpAllCommands.includes(message.content)){
		message.author.send(buildHelpString(message.author.id, 1))
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
		});;
		message.author.send(buildHelpString(message.author.id, 2))
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 4);
		});;
		f.deleteDiscMessage(message, 10000, 'helpAll');
	}
	// Start game
	else if(startsWith(message, balanceCommands)){
		balanceCommand(message);
	}

	// Duel, balance for 2 players
	else if(startsWith(message, duelCommands)){
		balanceCommand(message);
	}
	
	/*
		Starts a trivia game for the people in voice channel
		getDataQuestions options: 
			(amount, 0, 'easy')	All categories, easy difficulty
			(amount, 1) 	Games, all difficulties
			(amount, 2, 'hard')  Generic knowledge questions, hard difficulty
	*/
	else if(startsWith(message, triviaCommands)){
		var amount = 15;
		var mode = message.content.split(' '); 
		if(!trivia.getGameOnGoing()){
			if(mode.length >= 2){
				// Grabs second argument if available
				var category = 0;
				var difficulty = 0;
				switch(mode[1]){
					case 'allsubjectseasy':
						difficulty = 'easy';
						break;
					case 'all':
					case 'allquestions':
					case 'anything':
						break;
					case 'game':
					case 'games':
					case 'gamesall':
						category = 1;
						break;
					case 'gameseasy':
					case 'gameeasy':
						category = 1;
						difficulty = 'easy';
						break;
					case 'gamesmedium':
						category = 1;
						difficulty = 'medium';
						break;
					case 'gameshard':
						category = 1;
						difficulty = 'hard';
						break;
					case 'generic':
					case 'genericeasy':
						category = 2;
						difficulty = 'easy';
						break;
					case 'genericall':
						category = 2;
						break;
					default: // Check for all modes
						var categoryNum = parseInt(mode[1]);
						if(!isNaN(categoryNum) && categoryNum >= 9 && categoryNum <= 32){
							category = categoryNum;
							if(mode.length >= 3){
								if(mode[2] === 'easy' || mode[2] === 'medium' || mode[2] === 'hard'){
									difficulty = mode[2];
								}
							}
						} else {
							difficulty = 'easy';			
						}
				}
				console.log('Modes: category = ' + category + ', difficulty = ' + difficulty); // TODO: Print me somewhere (on Trivia start)
				trivia.getDataQuestions(message, amount, category, difficulty);
			} else{ // No mode chosen, use default
				console.log('No mode chosen, use default (mode.length = ' + mode.length + ')');
				trivia.getDataQuestions(message, amount, 0, 'easy'); // allsubjectseasy
			}
		} else { // Game currently on, don't start another one
			console.log('Duplicate Trivia starts, ignoring ' + message.content + ' ...');
		}
		f.deleteDiscMessage(message, 15000, 'trivia');
	}

	// Trivia modes - gives list of categories
	else if(triviaModesCommands.includes(message.content)){
		message.author.send(buildTriviaHelpCommands())
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
		});
		f.deleteDiscMessage(message, 10000, 'triviaModes');
	}

	// Show top 5 MMR 
	// TODO Games played only for cs, rating for otherRatings instead of mmr (as in player.js)
	else if(startsWith(message, leaderboardCommands)){
		var game = getModeChosen(message, player_js.getAllModes());
		db_sequelize.getHighScore(game, function(data){
			var s = '**Leaderboard Top 5 for ' + game + ':**\n';
			// TODO: Print``
			data.forEach(function(oneData){ // TODO: RefactorDB
				s += oneData.userName + ': \t**' + oneData[game] + ' ' + player_js.ratingOrMMR(game) + '**' + (game === player_js.getGameModes()[0] ? '\t(Games Played: ' + oneData.gamesPlayed + ')\n' : '\n');
			});
			f.print(message, s);
		});
		f.deleteDiscMessage(message, 15000, 'leaderboard');
	}
	// Sends private information about your statistics
	else if(startsWith(message, statsCommands)){
		stats(message);
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
	// Active Game commands: (After balance is made)
	else if(isActiveGameCommand(message)){
		var gameObject = game_js.getGame(message.author);
		if(!f.isUndefined(gameObject)){
			if(team1wonCommands.includes(message.content)){
				var activeResultVote = gameObject.getTeamWon();
				if(activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0){
					if(activeResultVote != 0){
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(1);
					f.print(message, voteText + ' (0/' + (gameObject.getBalanceInfo().team1.length + 1)+ ')', callbackVoteText);
				}
			}
			else if(team2wonCommands.includes(message.content)){
				var activeResultVote = gameObject.getTeamWon();
				if(activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0){
					if(activeResultVote != 0){
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(2);
					f.print(message, voteText + ' (0/' + (gameObject.getBalanceInfo().team2.length + 1)+ ')', callbackVoteText);
				}
			}
			else if(tieCommands.includes(message.content)){
				var activeResultVote = gameObject.getTeamWon();
				if(activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0){
					if(activeResultVote != 0){
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(0);
					f.print(message, voteText + ' (0/' + (gameObject.getBalanceInfo().team1.length + 1)+ ')', callbackVoteText);
				}
			}
			else if(cancelCommands.includes(message.content)){
				// Only creator of game can cancel it
				var matchupMessage = gameObject.getMatchupMessage();
				if(message.author.id === matchupMessage.author.id){
					// TODO Game: Remove game from game.js
					game_js.deleteGame(gameObject);
					f.print(message, 'Game canceled', function(message){
						f.deleteDiscMessage(message, 15000, 'gameCanceled');
						cleanOnGameEnd(gameObject);
					});
					f.deleteDiscMessage(message, 15000, 'c'); // prefix+c
				}else{
					f.print(message, 'Invalid command: Only the person who started the game can cancel it (' + matchupMessage.author.username + ')', callbackInvalidCommand);
				}
			}
	
			// Splits the players playing into the Voice Channels 'Team1' and 'Team2'
			else if(splitCommands.includes(message.content)){
				voiceMove_js.split(message, gameObject.getBalanceInfo(), gameObject.getActiveMembers());
				f.deleteDiscMessage(message, 15000, 'split');
			}
			// Take every user in 'Team1' and 'Team2' and move them to the same voice chat
			// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
			else if(startsWith(message, uniteCommands)){ 
				voiceMove_js.unite(message, gameObject.getActiveMembers());
				f.deleteDiscMessage(message, 15000, 'u');
			}
	
			// mapVeto made between one captain from each team
			else if(mapvetostartCommands.includes(message.content)){
				map_js.mapVetoStart(message, gameObject, client.emojis)
				.then(result => {
					gameObject.setMapMessages(result);
				});
				f.deleteDiscMessage(message, 15000, 'mapveto'); // Remove mapVeto text
			}
		} else {
			f.print(message, 'Invalid command: User ' + message.author + ' not currently in a game', callbackInvalidCommand);
		}
	}
	else if(startsWith(message,prefix)){ // Message start with prefix
		f.print(message, 'Invalid command: List of available commands at **' + prefix + 'help**', callbackInvalidCommand);
		f.deleteDiscMessage(message, 3000, 'invalidCommand'); // Overlaps delete call from callbackInvalidCommand above^
	}
}

// Returns true if message is an active game command
function isActiveGameCommand(message){
	return (team1wonCommands.includes(message.content) || team2wonCommands.includes(message.content) || tieCommands.includes(message.content) ||
			cancelCommands.includes(message.content) || splitCommands.includes(message.content) || startsWith(message, uniteCommands) || mapvetostartCommands.includes(message.content));
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

// Returns first valid gamemode from arguments
// TODO: A way to set cs1v1 if cs is given or dota if dota1v1 is given (instead of default)
function getModeChosen(message, modeCategory){
	var options = message.content.split(' '); // Message input, [0] is command, after is potential arguments
	var game = modeCategory[0]; // default command (Either cs or cs1v1)
	for(var i = 1; i < options.length; i++){
		if(modeCategory.includes(options[i])){
			console.log('DEBUG @b Game chosen as: ' + options[i]);
			game = options[i];
			break;
		}
	}
	return game;
}

async function cleanupExit(){
	await f.onExitDelete();
	await game_js.getActiveGames().map(game => cleanOnGameEnd(game));
}

function stats(message){
	var game = getModeChosen(message, player_js.getAllModes());
	db_sequelize.getPersonalStats(message.author.id, game, function(data, game){
		var s = '';
		if(data.length === 0){
			s += "**User doesn't have any games played**";
		}
		else {
			s += '**Your stats for ' + game + ':**\n';
			data.forEach(function(oneData){ // TODO: RefactorDB Either choose options OR show all stats that have gamesPlayed > 0
				s += oneData.userName + ': \t**' + oneData[game] + ' ' + player_js.ratingOrMMR(game) + '**' + (game === player_js.getGameModes()[0] ? '\t(Games Played: ' + oneData.gamesPlayed + ')\n' : '\n');
			});
		}
		message.author.send(s)  // Private message
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
		}); 
	});
}

// Start trivia game, sent from trivia when questions are fetched. 
exports.triviaStart = function(questions, message, author){
	// Start game in text channel with these questions
	var voiceChannel = message.guild.member(message.author).voiceChannel;
	if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Sets initial player array to user in disc channel if available
		var players = findPlayersStart(message, voiceChannel);
		db_sequelize.initializePlayers(players, function(playerList){
			trivia.startGame(message, questions, playerList); 
		});
	} else{ // No users in voice channel who wrote trivia
		db_sequelize.initializePlayers([player_js.createPlayer(author.username, author.id)], function(playerList){
			trivia.startGame(message, questions, playerList); // Initialize players as one who wrote message
		});
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

// Command used for starting a new game
function balanceCommand(message){
	var gameObjectExist = game_js.getGame(message.author);
	if(f.isUndefined(gameObjectExist)){ // User is not already in a game
		var voiceChannel = message.guild.member(message.author).voiceChannel; // Voice channel for user				
		if(voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
			// Initialize Game object
			var gameObject = game_js.createGame(message.id, message);
			var players = findPlayersStart(message, voiceChannel, gameObject); // initalize players objects with playerInformation
			var numPlayers = players.length;
			// Initialize balancing, Result is printed and stage = 1 when done
			if(numPlayers > 2 && numPlayers <= maxPlayers && numPlayers % 2 === 0){ // TODO: Allow uneven games? Requires testing to see if it works
				let game = getModeChosen(message, player_js.getGameModes());
				db_sequelize.initializePlayers(players, function(playerList){
					balance.balanceTeams(playerList, game, gameObject);
				});
			} else if(numPlayers === 2){
				let game = getModeChosen(message, player_js.getGameModes1v1());
				db_sequelize.initializePlayers(players, function(playerList){
					balance.balanceTeams(playerList, game, gameObject);
				});
			} else if((numPlayers === 1) && (adminUids.includes(message.author.id))){
				testBalanceGeneric(player_js.getGameModes()[0], gameObject);
			} else{
				f.print(message, 'Currently support games <= ' + maxPlayers + ' players', callbackInvalidCommand);
				game_js.deleteGame(gameObject);
			}
		} else {
			console.log('DEBUG: Remove the one that is false from if: ' + (voiceChannel !== null) + ', ' + (!f.isUndefined(voiceChannel)));
			f.print(message, 'Invalid command: Author of message must be in voiceChannel', callbackInvalidCommand); 
		}
		f.deleteDiscMessage(message, 10000, 'channelMessage (callback adding "<removed>")', function(msg){ // Remove the message, but let is remain in memory?
			msg.content += '<removed>';
		});
	} else{
		f.print(message, 'Invalid command: ' + message.author + ' is already in a game (' + gameObjectExist.getGameID() + ')', callbackInvalidCommand); 
		f.deleteDiscMessage(message, 10000, 'matchupMessage');
	}
}

// Initialize players array from given voice channel
// activeGame set to true => for phases where you should prevent others from overwriting (not trivia)
function findPlayersStart(message, channel, gameObject){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
	var players = [];
	var members = Array.from(channel.members.values());
	members.forEach(function(member){
		if(!member.bot){ // Only real users
			console.log('\t' + member.user.username + '(' + member.user.id + ')'); // Printar alla activa users i denna voice chat
			var tempPlayer = player_js.createPlayer(member.user.username, member.user.id);
			players.push(tempPlayer);
		}
	});
	if(!f.isUndefined(gameObject)){
		gameObject.setActiveMembers(members); // TODO Game
		//activeMembers = members;
	}
	return players;
}

// A Test for balancing and getting an active game without players available
function testBalanceGeneric(game, gameObject){
	console.log('\t<-- Testing Environment: 10 player game, res in console -->');
	var players = [];
	for(var i = 0; i < 10; i++){
		var tempPlayer = player_js.createPlayer('Player ' + i, i.toString());
		players.push(tempPlayer);
	}
	db_sequelize.initializePlayers(players, function(playerList){
		balance.balanceTeams(playerList, game, gameObject);
	})
}

// Handling of voteMessageReactions
// TODO: Refactor the following three methods
// TODO Game: check for old variable usage, use from gameobject instead
function voteMessageReaction(messageReaction, gameObject){
	// Check if majority number contain enough players playing
	if(messageReaction.emoji.toString() === emoji_agree){
		voteMessageTextUpdate(messageReaction)
		.then(result => {
			handleRelevantEmoji(true, teamWon, messageReaction, result.amountRelevant, result.totalNeeded, gameObject);	
		});
	}else if(messageReaction.emoji.toString() === emoji_disagree){
		var amountRelevant = countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
		var totalNeeded = (balanceInfo.team1.length + 1);
		handleRelevantEmoji(false, teamWon, messageReaction, amountRelevant, totalNeeded, gameObject);
	}
}

// Updates voteMessage on like / unlike the agree emoji
// Is async to await the voteMessage.edit promise
// TODO: Check if works still after refactor
async function voteMessageTextUpdate(messageReaction){
	var amountRel = await countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
	var totalNeed = await (balanceInfo.team1.length + 1);
	//console.log('DEBUG: @messageReactionAdd, count =', amountRelevant, ', Majority number is =', totalNeeded);
	var voteAmountString = ' (' + amountRel + '/' + totalNeed + ')';
	var newVoteMessage = (voteText + voteAmountString);
	voteMessage.content = newVoteMessage; // Not needed if await on edit? TODO: Check
	await voteMessage.edit(newVoteMessage);
	return {amountRelevant: amountRel, totalNeeded: totalNeed}
}

// Handle relevant emoji
function handleRelevantEmoji(emojiConfirm, winner, messageReaction, amountRelevant, totalNeeded, gameObject){
	//console.log('DEBUG: @handleRelevantEmoji', amountRelevant, totalNeeded, emojiConfirm);
	if(amountRelevant >= totalNeeded){
		if(emojiConfirm){
			console.log(emoji_agree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			mmr_js.updateMMR(winner, gameObject, function(message){
				console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
				f.deleteDiscMessage(message, removeBotMessageDefaultTime * 2, 'gameFinished');
				cleanOnGameEnd(gameObject);
			}); // Update mmr for both teams
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
		for(var i = 0; i < team.length; i++){
			if(user.id === team[i].uid){ // If person who reacted is in the game
				counter++;
			}
		}
	});
	return counter;
}

// Build String of trivia help commands
function buildTriviaHelpCommands(){
	var s = '*Available modes for trivia:* \n';
	s += prefix + 'trivia [category] [difficulty]\n';
	s += 'Arguments are optional\n';
	s += '**Difficulties:** *easy*, *medium*, *hard*, *all*\n';
	s += '**Categories:**\n';
	s += '*9*: General Knowledge\n';
	s += '*10*: Entertainment: Books\n';
	s += '*11*: Entertainment: Film\n';
	s += '*12*: Entertainment: Music\n';
	s += '*13*: Entertainment: Musicals & Theatres\n';
	s += '*14*: Entertainment: Television\n';
	s += '*15*: Entertainment: Video Games\n';
	s += '*16*: Entertainment: Board Games\n';
	s += '*17*: Science & Nature\n';
	s += '*18*: Science: Computers\n';
	s += '*19*: Science: Mathematics\n';
	s += '*20*: Mythology\n';
	s += '*21*: Sports\n';
	s += '*22*: Geography\n';
	s += '*23*: History\n';
	s += '*24*: Politics\n';
	s += '*25*: Art\n';
	s += '*26*: Celebrities\n';
	s += '*27*: Animals\n';
	s += '*28*: Vehicles\n';
	s += '*29*: Entertainment: Comics\n';
	s += '*30*: Science: Gadgets\n';
	s += '*31*: Entertainment: Japanese Anime & Manga\n';
	s += '*32*: Entertainment: Cartoons & Animations\n';
	return s;
}

// TODO commandHelp: Keep updated with recent information
function buildHelpString(userID, messageNum){
	if(messageNum === 0){
		// TODO: More simple help without detailed explanation, add this option to helpCommands line
		var s = '*Available commands for ' + bot_name + ':* \n';
		s += '**' + helpAllCommands.toString().replace(/,/g, ' | ') + '** Shows information about all commands in detail\n';
		s += '**' + prefix + 'ping** Returns time of response to server\n';
		s += '**' + helpCommands.toString().replace(/,/g, ' | ') + '** Shows the available commands\n';
		s += '**' + leaderboardCommands.toString().replace(/,/g, ' | ') + '** Returns Top 5 MMR holders\n';
		s += '**' + statsCommands.toString().replace(/,/g, ' | ') + '** Returns your own rating\n';
		s += '**' + prefix + 'roll [high] [low, high]** Rolls a number (0 - 100)\n';
		s += '**' + triviaCommands.toString().replace(/,/g, ' | ') + '** Starts a trivia game in the textchannel *' + trivia.getChannelName() + '*\n';
		s += '**' + triviaModesCommands.toString().replace(/,/g, ' | ') + '** Shows options for trivia mode\n';
		s += '**' + balanceCommands.toString().replace(/,/g, ' | ') + '** Starts an inhouse game with the players in the same voice chat as the message author.\n';
		s += '**' + team1wonCommands.toString().replace(/,/g, ' | ') + ' | ' + team2wonCommands.toString().replace(/,/g, ' | ') 
			+ '** Starts report of match result, requires majority of players to upvote from game for stats to be recorded.\n';
		s += '**' + tieCommands.toString().replace(/,/g, ' | ') + '** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n';
		s += '**' + cancelCommands.toString().replace(/,/g, ' | ') + '** Cancels the game, to be used when game was decided to not be played\n';
		s += '**' + splitCommands.toString().replace(/,/g, ' | ') + '** Splits voice chat into two separate voice chats\n';
		s += '**' + uniteCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite voice chat after game\n';
		s += '**' + uniteAllCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite all users active in voice to same channel\n';
		s += '**' + mapvetostartCommands.toString().replace(/,/g, ' | ') + '** Starts a map veto (*cs only*)\n';
		s += '**' + duelCommands.toString().replace(/,/g, ' | ') + '** Starts a duel, a 1v1 match between 2 people\n';
		if(adminUids.includes(userID)){
			s += '**' + exitCommands.toString().replace(/,/g, ' | ') + '** *Admin Command* Clear all messages, exit games, prepares for restart\n';
		}
		return s;	
	}
	if(messageNum === 1){
		var s = '*Available commands for ' + bot_name + ' (All Options):* \n';
		s += '(**[opt = default]** Syntax for optional arguments)\n\n';
		s += '**' + prefix + 'ping** Returns time of response to server\n\n'; // 
		s += '**' + helpCommands.toString().replace(/,/g, ' | ') + '** Shows the available commands\n\n';
		s += '**' + helpAllCommands.toString().replace(/,/g, ' | ') + '** Shows information about all commands in detail\n\n';
		s += '**' + leaderboardCommands.toString().replace(/,/g, ' | ') + ' [game = cs]** Returns Top 5 MMR holders\n'
			+ '**[game]** Opt. argument: name of the mode to retrieve top leaderboard for. Available modes are [' + player_js.getAllModes() + ']\n\n';
		s += '**' + statsCommands.toString().replace(/,/g, ' | ') + ' [game = cs]** Returns your own rating\n'
			+ '**[game]** Opt. argument: name of the mode to retrieve stats for. Available modes are [' + player_js.getAllModes() + ']\n\n';
		s += '**' + prefix + 'roll [high] [low, high]** Rolls a number (0 - 100)\n' 
		// TODO: More logical way of writing the parameters, since high change place depending on #args. Change in simple above as well
			+ '**[high]** (0 - high) \t\t**[low, high]** (low - high)\n\n';
		s += '**' + triviaCommands.toString().replace(/,/g, ' | ') + ' [questions = allsubjectseasy]** Starts a trivia game in the textchannel *' + trivia.getChannelName() + '*\n'
			+ '**[questions]** Opt. argument: name of question field and difficulty.\n\n';
		s += '**' + triviaModesCommands.toString().replace(/,/g, ' | ') + '** Shows options for trivia mode\n';
		if(adminUids.includes(userID)){
			s += '**' + exitCommands.toString().replace(/,/g, ' | ') + '** *Admin Command* Clear all messages, exit games, prepares for restart\n\n';
		}
		return s;	
	} else if(messageNum === 2){
		var s = '**Start Game commands**\n\n';
		s += '**' + balanceCommands.toString().replace(/,/g, ' | ') + ' [game = cs]** Starts an inhouse game with the players in the same voice chat as the message author. '
			+ 'Requires 2, 4, 6, 8 or 10 players in voice chat to work.\n'
			+ '**[game]** Opt. argument: name of the game being played. Available games are [' + player_js.getGameModes() + ']\n\n';
		s += '**' + team1wonCommands.toString().replace(/,/g, ' | ') + ' | ' + team2wonCommands.toString().replace(/,/g, ' | ') 
			+ '** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. '
			+ 'If majority of players downvote, this match result report disappears, use **' + prefix + 'cancel** for canceling the match after this\n\n';
		s += '**' + tieCommands.toString().replace(/,/g, ' | ') + '** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n\n';
		s += '**' + cancelCommands.toString().replace(/,/g, ' | ') + '** Cancels the game, to be used when game was decided to not be played\n'
			+ 'Game can only be canceled by the person who started the game\n\n';
		s += '**' + splitCommands.toString().replace(/,/g, ' | ') + '** Splits voice chat into two separate voice chats\n\n';
		s += '**' + uniteCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite voice chat after game\n'
			+ '**[channel]** Opt. argument: name of channel to unite in\n\n';
		s += '**' + uniteAllCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite all users active in voice to same channel\n'
			+ '**[channel]** Opt. argument: name of channel to unite in\n\n';
		s += '**' + mapvetostartCommands.toString().replace(/,/g, ' | ') + '** Starts a map veto (*cs only*)\n\n';
		s += '**' + duelCommands.toString().replace(/,/g, ' | ') + '** Starts a duel, a 1v1 match between 2 people\n'
			+ 'If only two people are in voiceChannel, start duel between them.\n';
			/*
			+ '**[player]** Required if more than 2 players in voiceChannel. Person who is challenged\n'
			+ '**[game]** Opt. argument: name of the game being played. Available games are [' + player_js.getGameModes1v1() + ']\n\n';*/
		return s;	
	}
}

// Used to delete messages if game ended
// Takes GameObject to clean
function cleanOnGameEnd(gameObject){
	var mapMessages = gameObject.getMapMessages();
	if(!f.isUndefined(mapMessages)){
		for(var i = mapMessages.length - 1; i >= 0; i--){
			f.deleteDiscMessage(mapMessages[i], 0, 'mapMessages['+i+']', function(msg){
				var index = mapMessages.indexOf(msg);
				if (index > -1) {
					mapMessages.splice(index, 1);
				}
			});	
		}
	}
	if(!f.isUndefined(gameObject.getMapStatusMessage())){
		f.deleteDiscMessage(gameObject.getMapStatusMessage(), 0, 'mapStatusMessage');	
	}
	if(!f.isUndefined(gameObject.getVoteMessage())){
		f.deleteDiscMessage(gameObject.getVoteMessage(), 0, 'voteMessage');
	}
	if(!f.isUndefined(gameObject.getTeamWonMessage())){
		f.deleteDiscMessage(gameObject.getTeamWonMessage(), 0, 'teamWonMessage');
	}
	if(!f.isUndefined(gameObject.getMatchupServerMsg())){
		//console.log('DEBUG getMatchupServerMsg cleanOnGameEnd', gameObject.getMatchupServerMsg().content);
		f.deleteDiscMessage(gameObject.getMatchupServerMsg(), 0, 'matchupServerMsg');
	}
	if(!f.isUndefined(gameObject.getMatchupMessage())){
		//console.log('DEBUG matchupMessage cleanOnGameEnd', gameObject.getMatchupMessage().content);
		f.deleteDiscMessage(gameObject.getMatchupMessage(), 0, 'matchupMessage');
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

function noop(message){ // callback used when no operation is wanted
	// Doesn't delete the message
}

exports.printMessage = function(message, channelMessage, callback = noop){ // Default: NOT removing message
	f.print(channelMessage, message, callback);
}

exports.getPrefix = function(){
	return prefix;
}

exports.getLukasIP = function(){
	return lukasIP;
}

exports.getRemoveTime = function(){
	return removeBotMessageDefaultTime;
}

exports.getAdminUids = function(){
	return adminUids;
}