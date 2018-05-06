'use strict';

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const ArrayList = require('arraylist');
const balance = require('./balance');

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
var glblMessage;
var balanceInfo;

//login
client.login(token);

client.on('message', message => {
	if(message.author.bot){
		message.delete(60000); // 300000
	}
	console.log('MSG: ', message.content); // Doesn't print bot messages to console
	if(message.content == 'hej'){
		message.channel.send('lul')
	}
	else if(message.content === prefix+'ping'){
		console.log('PingAlert, user had !ping as command');
		message.channel.send('Pong');
		message.delete(300000);
	}
	else if(message.content === prefix+'help' || message.content === prefix+'h'){
		message.channel.send(buildHelpString());
		message.delete(300000);
	}
	else if(message.content === prefix+'clear'){
		// TODO: Delete the inhouse-bot created messages
	}
	else if(message.content === `${prefix}b` || message.content === `${prefix}balance` || message.content === `${prefix}inhouseBalance`){
		//console.log(message); // Can print for information about hierarchy in discord message
		if(stage === 0){
			glblMessage = message;
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && typeof voiceChannel != 'undefined'){ // Makes sure user is in a voice channel
				findPlayersStart(message, voiceChannel);
			} else {
				message.channel.send('Author of message must be in voiceChannel'); 
			}
			message.delete(10000);
		} else{
			print(message, 'Invalid command: Inhouse already ongoing', 5000);
			message.delete(5000);
		}
	}

	// TODO Show top 3 MMR 
	else if(message.content === `${prefix}leaderboard`){
		message.delete(5000);
	}
	else if(message.content === `${prefix}stats`){ // TODO: Prints private mmr
		message.delete(5000);
	}

	else if(stage === 1){ // stage = 1 -> balance is made
		// Add some confirmation step, also game was not player command
		if(message.content === `${prefix}team1Won`){
			balance.updateMMR(1, balanceInfo); // Update mmr for both teams
			message.delete(15000);
		}
		else if(message.content === `${prefix}team2Won`){
			balance.updateMMR(2, balanceInfo); // Update mmr for both teams
			message.delete(15000);
		}
		else if(message.content === `${prefix}tie` || message.content === `${prefix}draw`){
			balance.updateMMR(0, balanceInfo); // Update mmr for both teams
			message.delete(15000);
		}
		else if(message.content === `${prefix}gameNotPlayed` || message.content === `${prefix}noGame` || message.content === `${prefix}cancel` || message.content === `${prefix}c`){
			// balance.resetVariables(); // Might be needed to avoid bugs?
			stage = 0;
			message.delete(15000);
		}

		// TODO: Split and unite voice channels, need to have special channels perhapz
		else if(message.content === `${prefix}split`){

		}
		// TODO: Take every user in 'Team 1' and 'Team 2' and move them to some default voice
		else if(message.content === `${prefix}unite` || message.content === `${prefix}u`){ 

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
	}
	*/
});

//Create more events to do fancy stuff with discord API



function findPlayersStart(message, channel){
	console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
	var numPlayers = channel.members.size
	if(numPlayers == 10 || numPlayers == 8 || numPlayers == 6 || numPlayers == 4){
		// initalize 10 Player objects with playerInformation
		var players = new ArrayList;
		channel.members.forEach(function(members){
			if(!members.bot){ // Only real users
				console.log('\t' + members.user.username + '(' + members.user.id + ')'); // Printar alla activa users i denna voice chatt
				var tempPlayer = balance.createPlayer(members.user.userName, members.user.id);
				players.add(tempPlayer);
			}
		});
		balance.initializePlayers(players, dbpw); // Initialize balancing, Result is printed when done
	} else if((numPlayers === 1 ||numPlayers === 2) && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
		console.log('\t<-- Testing Environment: 10 player game, res in console -->');
		var players = new ArrayList;
		for(var i = 0; i < 10; i++){
			var tempPlayer = balance.createPlayer('Player ' + i, i);
			//console.log('DEBUG: @findPlayersStart, tempPlayer =', tempPlayer);
			players.add(tempPlayer);
		}
		balance.initializePlayers(players, dbpw); // Initialize balancing, return result
	} else{
		console.log('Currently only support games for 4, 6, 8 and 10 players'); 
	}
}

function print(messageVar, message, deleteTime){
	console.log(message);
	if(deleteTime === -1){
		messageVar.channel.send(message);
	}else {
		messageVar.channel.send(message); // Auto removes every bot message after 300 sec 
	}
}

// TODO: Add all available commands
function buildHelpString(){
	var s = '*Available commands are: *';
	s += '**' + prefix + 'b | '+ prefix + 'balance | '+ prefix + 'inhouseBalance** Starts an inhouse game with the teams ready in the lobby\n';
	s += '**' + prefix + 'team1Won | ' + prefix + 'team2Won | '+ prefix + 'draw | ' + prefix + 'cancel** Different commands for ending a game\n'
	s += '**' + prefix + 'help** Gives the available commands\n';
	return s;
}

exports.setStage = function(value){
	stage = value;
}

exports.printMessage = function(message, time){
	print(glblMessage, message, -1);
}

exports.setBalanceInfo = function(obj){
	balanceInfo = obj;
}