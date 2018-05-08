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
		URGENT: Fix async/await works, Currently syntax error even though node version should be correct

		Handle all bot sent messages with .then on send instead of looking at a received message, handle the send promise instead
		Better Printout / message to clients (Currently as message, but not nice looking) (Deluxe: maybe image if possible)
		better names for commands
		If internet dies, gets unhandled "error" event, Client.emit, on the default case in the onMessage event
		Add test method so system can be live without updating data base on every match (-balance test or something) 
		Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
		
		On exit, remove messages that are waiting for be removed (For better testing)

		Gör så att botten kan göra custom emojis, och adda de till servern för usage (ex. mapVeto emotes och seemsgood)
*/

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
});

// TODO: Reflect on stage. Alternative: neutral = 0, make a start stage = 1 -> mapveto/split/start, and a end stage = 2 -> team1Won/Team2won/unite/gnp etc
var stage = 0; // Current: Stage = 0 -> nothing started yet, default. Stage = 1 -> rdy for: mapVeto/split/team1Won/team2Won/gameNotPlayed. 
var balanceInfo; // Object: {team1, team2, difference, avgT1, avgT2, avgDiff} Initialized on transition between stage 0 and 1. 

var matchupMessage;
var matchupMessageBool;
var resultMessageBool;
var voteMessage;
var teamWonMessage;
var teamWon;

const emoji_agree = '👌'; // 👍 Borde vara seemsgood emoji
const emoji_disagree = '👎'; 
const emoji_error = '❌'; //'🤚'; // TODO: Red X might be better

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';

const removeBotMessageDefaultTime = 60000; // 300000

//login
client.login(token);

// TODO: Move from on, to functions
client.on('message', message => {
	// CASE 1: Bot sent message
	if(message.author.bot && message.author.username === bot_name){
		botMessage(message); // Temp function, should use async/await instead
	}else{ // CASE 2: Message sent from user
		if(typeof message.channel.guild != 'undefined'){
			handleMessage(message);
		}else{ // Someone tried to DM the bot
			console.log('DM msg = ' + message.author.username + ': ' + message.content);
			message.author.send('Send commands in a server - not to me!');
		}
	}	
});

// TODO: Add messageReactionRemove to update message as well
client.on('messageReactionAdd', messageReaction => {
	//console.log('DEBUG: @messageReactionAdd', stage, messageReaction.message.content, messageReaction.emoji);
	if(stage === 1){
		if(messageReaction.message.content === voteMessage.content){ // Check if emojiReaction is on voteMessage
			voteMessageReaction(messageReaction);
		}
		else{ // Print adds?
			console.log('DEBUG: @messageReactionAdd', messageReaction.message.content, voteMessage.content);
		}
	}
});

client.on('messageReactionRemove', messageReaction => {
	//console.log('DEBUG: @messageReactionAdd', stage, messageReaction.message.content, messageReaction.emoji);
	if(stage === 1){
		if(messageReaction.message.content === voteMessage.content){ // Check if emojiReaction is on voteMessage
			voteMessageTextUpdate(messageReaction);
		}
		else{ // Print adds?
			console.log('DEBUG: @messageReactionRemove', messageReaction.message.content, voteMessage.content);
		}
	}
});

//Create more events to do fancy stuff with discord API

// Main message handling function 
function handleMessage(message){ // TODO: Decide if async needed
		console.log('MSG (' + message.channel.guild.name + '.' + message.channel.name + ') ' + message.author.username + ':', message.content); 	

		if(message.content == 'hej'){
			print(message, 'Hej ' + message.author.username);
		}
		else if(message.content === prefix+'ping'){ // Good for testing prefix and connection to bot
			console.log('PingAlert, user had !ping as command');
			print(message, 'Pong');
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
					print(message, 'Author of message must be in voiceChannel'); 
				}
				message.delete(10000);
			} else{
				print(message, 'Invalid command: Inhouse already ongoing'); 
				message.delete(10000);
			}
		}
		
		// TODO Show top 3 MMR 
		else if(message.content === `${prefix}leaderboard`){
			message.delete(5000);
		}
		// TODO: Prints private mmr
		else if(message.content === `${prefix}stats`){ 
			// message.author.send(); // Private message
			message.delete(5000);
		}

		else if(stage === 1){ // stage = 1 -> balance is made
			if(message.content === `${prefix}team1Won`){
				teamWonMessage = message;
				teamWon = 1;
				print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			}
			else if(message.content === `${prefix}team2Won`){
				teamWonMessage = message;
				teamWon = 2;
				print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			}
			else if(message.content === `${prefix}tie` || message.content === `${prefix}draw`){
				teamWonMessage = message;
				teamWon = 0;
				print(message, voteText + ' (0/' + (balanceInfo.team1.size() + 1)+ ')');
			}
			else if(message.content === `${prefix}c` || message.content === `${prefix}cancel` || message.content === `${prefix}gameNotPlayed`){
				// TODO: Decide whether cancel might also require some confirmation? 
				if(message.author.id === matchupMessage.author.id){
					stage = 0;
					resultMessageBool = true;
					print(message, 'Game canceled');
					message.delete(15000); // prefix+c
				}else{
					print(message, 'Invalid command: Only the person who started the game can cancel it (' + matchupMessage.author.username + ')');
				}
			}

			// TODO: Split and unite voice channels, need to have special channels perhapz
			else if(message.content === `${prefix}split`){

			}
			// TODO: Take every user in 'Team 1' and 'Team 2' and move them to some default voice
			else if(message.content === `${prefix}u` || message.content === `${prefix}unite`){ 

			}

			// TODO: Unites all channels, INDEPENDENT of game ongoing
			else if(message.content === `${prefix}ua` || message.content === `${prefix}uniteAll`){ 

			}

			// TODO: Decide design
			// 
			else if(message.content === `${prefix}mapVeto`){
				// Get captain from both teams
				var captain1 = getHighestMMR(balanceInfo.team1);
				var captain2 = getHighestMMR(balanceInfo.team2);
				// Get maps
				// TODO: Database on Map texts, map emojis( and presets of maps, 5v5, 2v2 etc)
				// Temp solution: 
				mapMessages(message);
			}
			// TODO: mapVeto using majority vote instead of captains
			else if(message.content === `${prefix}mapVetoMajority`){

			}

		}

		else if(startsWith(message,prefix)){ // Message start with prefix
			print(message, 'Invalid command: List of available commands at **' + prefix + 'help**');
			message.delete(3000);
		}
	}
}

async function mapMessages(message){
	var messages = [];
	messages.push(await print(message, ':Dust2: Dust2'));
	messages.push(await print(message, ':Inferno: Inferno'));
	messages.push(await print(message, ':Mirage: Mirage'));

	for(var i = 0; i < messages.length; i++){
		messages[i].react(emoji_error);
	}

	// TODO: Check to see what happens
}

// Temp function, all of these actions should be handled by await:s
async function botMessage(message){
	// TODO Feat: Add functionality to remove player written message after ~removeBotMessageDefaultTime sec, prevent flooding
	// TODO Refactor: best way to consistently give custom time for removal of these bot messages.
	if(matchupMessageBool){ // Don't remove message about matchup UNTIL results are in
		matchupMessageBool = false;
	}else if(resultMessageBool){
		resultMessageBool = false;
		matchupMessage.delete(); // Remove matchup message when results are in
		if(startsWith(message, '**Team')){ // Team 1 / 2 won! 
			message.delete(removeBotMessageDefaultTime * 2);  // Double time for removing result TODO: Decide if this is good
			console.log('DEBUG: @botMessage - Unknown Message Error will follow after this - unsure why'); // TODO: Find source of error 
			// Discussed here - https://stackoverflow.com/questions/44284666/discord-js-add-reaction-to-a-bot-message
		}else if(startsWith(message, 'Game canceled')){
			matchupMessage.delete(); // Delete message immediately on game cancel
			message.delete(15000); 
		}
	}else if(startsWith(message, voteText)){
		voteMessage = message;
		await message.react(emoji_agree); 
		message.react(emoji_disagree);
	}else{ // Default case for bot messages, remove after time
		if(startsWith(message, 'Invalid command: ')){
			message.delete(15000);
			message.react(emoji_error);  
		}else if(startsWith(message, 'Hej')){
			// Don't remove Hej message
		}else{
			message.delete(removeBotMessageDefaultTime); 		
		}
	}
}

// Updates voteMessage on like / unlike the agree emoji
// Is async to await the voteMessage.edit promise
async function voteMessageTextUpdate(messageReaction){
	var amountRelevant = countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
	var totalNeeded = (balanceInfo.team1.size() + 1);
	//console.log('DEBUG: @messageReactionAdd, count =', amountRelevant, ', Majority number is =', totalNeeded);
	var voteAmountString = ' (' + amountRelevant + '/' + totalNeeded + ')';
	var newVoteMessage = (voteText + voteAmountString);
	voteMessage.content = newVoteMessage; // Not needed if await on edit? TODO: Check
	await voteMessage.edit(newVoteMessage)
	return {amountRelevant: amountRelevant; totalNeeded: totalNeeded}
}

// Handling of voteMessageReactions
function voteMessageReaction(messageReaction){
	// Check if majority number contain enough players playing
	if(messageReaction.emoji.toString() === emoji_agree){
		var voteMessageReaction = voteMessageTextUpdate();
		handleRelevantEmoji(true, teamWon, messageReaction, voteMessageReaction.amountRelevant, voteMessageReaction.totalNeeded);	
	}else if(messageReaction.emoji.toString() === emoji_disagree){
		var amountRelevant = countAmountUsersPlaying(balanceInfo.team1, messageReaction.users) + countAmountUsersPlaying(balanceInfo.team2, messageReaction.users);
		var totalNeeded = (balanceInfo.team1.size() + 1);
		handleRelevantEmoji(false, teamWon, messageReaction, amountRelevant, totalNeeded);
	}
}

// Returns boolean of if message starts with string
function startsWith(message, string){
	return (message.content.lastIndexOf(string, 0) === 0)
}

// Returns highest mmr player object from team
function getHighestMMR(team){
	var highestMMR = -1;
	var index = -1;
	for(var i = 0; i < team.size(); i++){
		if(team[i].mmr > highestMMR){
			highestMMR = team[i].mmr;
			index = i;
		}
	}
	return team[index];
}

function findPlayersStart(message, channel){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
	var numPlayers = channel.members.size
	if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){
		// initalize 10 Player objects with playerInformation
		var players = new ArrayList;
		channel.members.forEach(function(member){
			if(!member.bot){ // Only real users
				console.log('\t' + member.user.username + '(' + member.user.id + ')'); // Printar alla activa users i denna voice chatt
				var tempPlayer = player_js.createPlayer(member.user.username, member.user.id);
				players.add(tempPlayer);
			}
		});
		balance.initializePlayers(players, dbpw); // Initialize balancing, Result is printed when done
	} else if((numPlayers === 1 || numPlayers === 2) && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
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

function handleRelevantEmoji(emojiConfirm, winner, messageReaction, amountRelevant, totalNeeded){
	if(amountRelevant >= totalNeeded){
		if(emojiConfirm){
			console.log(emoji_agree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			mmr_js.updateMMR(winner, balanceInfo); // Update mmr for both teams
			messageReaction.message.delete(3000);
			teamWonMessage.delete(3000);
		}else{
			console.log(emoji_disagree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			messageReaction.message.delete(3000);
			teamWonMessage.delete(3000);
		}
	}
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

// TODO: Keep updated with recent information
function buildHelpString(){
	var s = '*Available commands for ' + bot_name + ':* (Commands marked with **TBA** are To be Added) \n';
	s += '**' + prefix + 'ping** *Pong*\n';
	s += '**' + prefix + 'b | balance | inhouseBalance** Starts an inhouse game with the players in the same voice chat as the message author. '
		+ 'Requires 4, 6, 8 or 10 players in voice chat to work\n';
	s += '**' + prefix + 'team1Won | ' + prefix + 'team2Won** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. '
		+ 'If majority of players downvote, this match result report dissapears, use **' + prefix + 'cancel** for canceling the match after this\n';
	s += '**' + prefix + 'draw | tie** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n';
	s += '**' + prefix + 'c | cancel** Cancels the game, to be used when game was decided to not be played\n';
	s += '**' + prefix + 'h | help** Shows the available commands\n';
	s += '**' + prefix + 'leaderboard** Returns Top 3 MMR holders **TBA**\n';
	s += '**' + prefix + 'stats** Returns your own rating **TBA**\n';
	s += '**' + prefix + 'split** Splits voice chat **TBA**\n';
	s += '**' + prefix + 'u | unite** Unite voice chat after game **TBA**\n';
	s += '**' + prefix + 'mapVeto** Start map veto **TBA**\n';
	return s;
}

// Used to print message in channel, use for every use of channel.send for consistency
// Returns promise for use in async functions
function print(messageVar, message){
	console.log(message);
	return messageVar.channel.send(message);
}



// TODO: Maybe add setResult/MatchupMessage functionality into this, depending on stage
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