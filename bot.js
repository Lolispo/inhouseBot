'use strict';

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const ArrayList = require('arraylist');
const balance = require('./balance');
const mmr_js = require('./mmr');
const player_js = require('./player')

//get config data
const { prefix, token, dbpw } = require('./conf.json');

/*
	TODO: 
		Better Printout / message to clients (Currently as message, but not nice looking) (Deluxe: maybe image if possible)
		better names for commands
		Choose winner command (Deluxe: Approved by chat emotes on message? 6 of the players playing )

	Deluxe: 
		Move players into separate channels on team generation
		Remove player written message after a couple of seconds (at least for testing purpose) to prevent chat over flooding
		Mapveto command

*/

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
});

// TODO: Design differ maybe? make a start stage = 1, mapveto/split/start, and a end stage = 2 -> team1Won/Team2won/unite/gnp etc
// Current: Stage = 0 -> nothing started yet, default. Stage = 1 -> rdy for: mapVeto/split/team1Won/team2Won/gameNotPlayed. 
var stage = 0;
var balanceInfo;

var matchupMessage;
var matchupMessageBool;
var resultMessageBool;
var voteMessage;
var voteMessageBool;
const voteText = '**Majority of players that played the game need to confirm this result**';

const removeBotMessageDefaultTime = 60000; // 300000

//login
client.login(token);

client.on('message', message => {
	// CASE 1: Bot sent message
	if(message.author.bot){ 
		// TODO: Check best way to consistently give custom time for removal of these bot messages.
		if(matchupMessageBool){ // Don't remove message about matchup UNTIL results are in
			matchupMessageBool = false;
		}else if(resultMessageBool){
			console.log('Check me: **Team ', (message.content.lastIndexOf('**Team', 0) === 0));
			console.log('Check me: Game canceled', (message.content.lastIndexOf('Game canceled', 0) === 0));
			resultMessageBool = false;
			matchupMessage.delete(); // Remove matchup message when results are in
			if(message.content.lastIndexOf('**Team', 0) === 0){
				message.delete(removeBotMessageDefaultTime * 2);  // Double time for removing result 
			}else if(message.content.lastIndexOf('Game canceled', 0) === 0){
				message.delete(); // Delete message immediately on game cancel
			}
		}else if(voteMessageBool){
			voteMessageBool = false;
			voteMessage = message;
		}else{ // Default case for bot messages, remove after time
			message.delete(removeBotMessageDefaultTime); // 300000
		}
	}else{ // Doesn't print bot messages to console
		console.log('MSG (' + message.channel.guild.name + '.' + message.channel.name + ') ' + message.author.username + ':', message.content); 	
	}

	// CASE 2: Message sent from user

	if(message.content == 'hej'){
		message.channel.send('Hej ' + message.author.username);
	}
	else if(message.content === prefix+'ping'){ // Good for testing prefix and connection to bot
		console.log('PingAlert, user had !ping as command');
		message.channel.send('Pong');
		message.delete(removeBotMessageDefaultTime);
	}
	// Sends available commands privately to the user
	else if(message.content === prefix+'help' || message.content === prefix+'h'){
		message.author.send(buildHelpString());
		message.delete(10000);
	}
	else if(message.content === `${prefix}b` || message.content === `${prefix}balance` || message.content === `${prefix}inhouseBalance`){
		//console.log(message); // Can print for information about hierarchy in discord message
		if(stage === 0){
			matchupMessage = message;
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && typeof voiceChannel != 'undefined'){ // Makes sure user is in a voice channel
				findPlayersStart(message, voiceChannel);
			} else {
				message.channel.send('Author of message must be in voiceChannel'); 
			}
			message.delete(10000);
		} else{
			print(message, 'Invalid command: Inhouse already ongoing'); // TODO: When invalid commands are sent from the bot, add cross reaction to it
			message.delete(10000);
		}
	}
	
	// TODO: Delete the inhouse-bot created messages (that are NOT active) NOTE: This shouldn't be required if system works DEPRECATED FUNCTION
	else if(message.content === prefix+'clear'){
	
	}
	// TODO Show top 3 MMR 
	else if(message.content === `${prefix}leaderboard`){
		message.delete(5000);
	}
	// TODO: Prints private mmr
	else if(message.content === `${prefix}stats`){ 
		message.delete(5000);
	}

	else if(stage === 1){ // stage = 1 -> balance is made
		// Add some confirmation step, also game was not player command TODO: Through emoji event
		if(message.content === `${prefix}team1Won`){
			message.react('👍');
			message.react('👎');
			print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			voteMessageBool = true;
		}
		else if(message.content === `${prefix}team2Won`){
			message.react('👍');
			message.react('👎');
			print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			voteMessageBool = true;
		}
		else if(message.content === `${prefix}tie` || message.content === `${prefix}draw`){
			message.react('👍');
			message.react('👎');
			print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			voteMessageBool = true;
		}
		else if(message.content === `${prefix}c` || message.content === `${prefix}cancel` || message.content === `${prefix}gameNotPlayed`){
			// balance.resetVariables(); // Might be needed to avoid bugs?
			stage = 0;
			resultMessageBool = true;
			print(message, 'Game canceled');
			message.delete(15000);
		}

		// TODO: Split and unite voice channels, need to have special channels perhapz
		else if(message.content === `${prefix}split`){

		}
		// TODO: Take every user in 'Team 1' and 'Team 2' and move them to some default voice
		else if(message.content === `${prefix}u` || message.content === `${prefix}unite`){ 

		}

		else if(message.content === `${prefix}mapVeto`){

		}
	}

	// TODO Feat: Add functionality to remove player written message after ~5 sec, prevent flooding

	/*
	// TODO: Handle that command could not be read (ex. !memes) TODO: GIVE MESSAGE 'use !help' SOMETHING
	else if(){ // <- logic check for string starting with `${prefix}`
		console.log('Invalid command')
	}
	*/
});

client.on('messageReactionAdd', messageReaction => {
	if(stage === 1){
		if(messageReaction.message.content === `${prefix}team1Won`){
			// Check if majority number contain enough players playing
			if(messageReaction.emoji === '👍'){
				var voteAmountString = handleRelevantEmoji(true, 1);
				voteMessage.edit(voteText + voteAmountString);
			}else if(messageReaction.emoji === '👎'){
				handleRelevantEmoji(false, 1);
			}
		}
		else if(messageReaction.message.content === `${prefix}team2Won`){
			// Check if majority number contain enough players playing
			if(messageReaction.emoji === '👍'){
				var voteAmountString = handleRelevantEmoji(true, 2);
				voteMessage.edit(voteText + voteAmountString);
			}else if(messageReaction.emoji === '👎'){
				handleRelevantEmoji(false, 2);
			}
		}
		else if(messageReaction.message.content === `${prefix}tie` || message.content === `${prefix}draw`){
			// Check if majority number contain enough players playing
			if(messageReaction.emoji === '👍'){
				var voteAmountString = handleRelevantEmoji(true, 0);
				voteMessage.edit(voteText + voteAmountString); // Update chat message if change
			}else if(messageReaction.emoji === '👎'){
				handleRelevantEmoji(false, 0);
			}
		}
	}
});

//Create more events to do fancy stuff with discord API


function findPlayersStart(message, channel){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
	var numPlayers = channel.members.size
	if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){
		// initalize 10 Player objects with playerInformation
		var players = new ArrayList;
		channel.members.forEach(function(member){
			if(!member.bot){ // Only real users
				console.log('\t' + member.user.username + '(' + member.user.id + ')'); // Printar alla activa users i denna voice chatt
				var tempPlayer = player_js.createPlayer(member.user.userName, member.user.id);
				players.add(tempPlayer);
			}
		});
		balance.initializePlayers(players, dbpw); // Initialize balancing, Result is printed when done
	} else if((numPlayers === 1 ||numPlayers === 2) && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
		console.log('\t<-- Testing Environment: 10 player game, res in console -->');
		var players = new ArrayList;
		for(var i = 0; i < 10; i++){
			var tempPlayer = player_js.createPlayer('Player ' + i, i);
			//console.log('DEBUG: @findPlayersStart, tempPlayer =', tempPlayer);
			players.add(tempPlayer);
		}
		balance.initializePlayers(players, dbpw); // Initialize balancing, return result
	} else{
		console.log('Currently only support games for 4, 6, 8 and 10 players'); 
	}
}

function handleRelevantEmoji(emojiConfirm, winner, messageReaction){
	var amountRelevant = countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
	var totalNeeded = (balanceInfo.team1.size() + 1);
	//console.log('DEBUG: @messageReactionAdd, count =', amountRelevant, ', Majority number is =', totalNeeded);
	voteAmountString = ' (' + amountRelevant + '/' + totalNeeded + ')';
	if(amountRelevant >= totalNeeded){
		if(emojiConfirm){
			console.log('Thumbsup CONFIRMED' + voteAmountString);
			mmr_js.updateMMR(winner, balanceInfo); // Update mmr for both teams
			messageReaction.message.delete(2000);
		}else{
			console.log('Thumbsdown CONFIRMED' + voteAmountString);
			messageReaction.message.delete(2000);
		}
	}
	return voteAmountString;
}

function countAmountUsersPlaying(team, peopleWhoReacted){ // Count amount of people who reacted are part of this team
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

function print(messageVar, message){
	console.log(message);
	messageVar.channel.send(message);
}

// TODO: Keep updated with recent information
function buildHelpString(){
	var s = '*Available commands for inhouse-bot:* (Commands marked with **TBA** are To be Added) \n';
	s += '**' + prefix + 'b | balance | inhouseBalance** Starts an inhouse game with the players in the same voice chat as the message author. '
		+ 'Requires 4, 6, 8 or 10 players in voice chat to work\n';
	s += '**' + prefix + 'team1Won | ' + prefix + 'team2Won** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. '
		+ 'If majority of players downvote, this match result report dissapears, use **' + prefix + 'cancel** for canceling the match after this\n';
	s += '**' + prefix + 'draw | tie** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n';
	s += '**' + prefix + 'c | cancel** Cancels the game, to be used when game was decided to not be played\n'
	s += '**' + prefix + 'h | help** Gives the available commands\n';
	s += '**' + prefix + 'leaderboard** Returns Top 3 MMR holders **TBA**\n'
	s += '**' + prefix + 'stats** Returns your own rating **TBA**\n'
	s += '**' + prefix + 'split** Splits voice chat **TBA**\n'
	s += '**' + prefix + 'u | unite** Unite voice chat after game **TBA**\n'
	s += '**' + prefix + 'mapVeto** Start map veto **TBA**\n'
	s += '**' + prefix + 'h | help**'
	return s;
}

exports.setStage = function(value){
	stage = value;
}

exports.printMessage = function(message){
	print(matchupMessage, message);
}

exports.setBalanceInfo = function(obj){
	balanceInfo = obj;
}

exports.setResultMessage = function(value){
	resultMessageBool = value;
}

exports.setMatchupMessage = function(value){
	matchupMessageBool = value;
}