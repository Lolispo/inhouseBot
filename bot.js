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
// Stage = 0 -> nothing started yet, default. Stage = 1 -> rdy for: mapVeto/split/team1Won/team2Won/gameNotPlayed. 
var stage = 0;
var glblMessage;

client.on('message', message => {
	console.log('MSG: ', message.content);
	if(message.content == 'hej'){
		message.channel.send('lul')
	}
	else if(message.content === prefix+'ping'){
		console.log('PingAlert, user had !ping as command');
		message.channel.send('Pong');
	}
	// TODO: Remove player written message
	else if(message.content === `${prefix}inhouseBalance` || message.content === `${prefix}b` || message.content === `${prefix}active`){
		//console.log(message); // Can print for information about hierarchy in discord message
		if(stage === 0){
			glblMessage = message;
			var voiceChannel = message.guild.member(message.author).voiceChannel;
				
			if(voiceChannel !== null && typeof voiceChannel != 'undefined'){ // Makes sure user is in a voice channel
				findPlayersStart(message, voiceChannel);
			} else {
				message.channel.send('Author must be in voiceChannel');
			}
		} else{
			print(message, 'Invalid command: Inhouse already ongoing');
		}
	}

	else if(stage === 1){ // stage = 1 -> balance is made
		// Add some confirmation step, also game was not player command
		if(message.content === `${prefix}team1Won`){
			balance.updateMMR(true); // Update mmr for both teams
		}
		else if(message.content === `${prefix}team2Won`){
			balance.updateMMR(false); // Update mmr for both teams
		}
		else if(message.content === `${prefix}gameNotPlayed` || message.content === `${prefix}noGame`){
			// balance.resetVariables(); // Might be needed to avoid bugs?
			stage = 0;
		}

		// TODO: Split and unite voice channels, need to have special channels perhapz
		else if(message.content === `${prefix}split`){

		}
		else if(message.content === `${prefix}unite`){

		}

		else if(message.content === `${prefix}mapVeto`){

		}
	}

	// TODO Feat: Add functionality to remove player written message after ~5 sec, prevent flooding

	/*
	// TODO: Handle that command could not be read (ex. !memes)
	else if(){ // <- logic check for string starting with `${prefix}`
		console.log('Invalid command')
	}
	}
	*/
});

//Create more events to do fancy stuff with discord API


//login
client.login(token);

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
		var result = balance.initializePlayers(players, dbpw); // Initialize balancing, return result
		// Show result to discord users
		message.channel.send(result);
	} else if((numPlayers === 1 || numPlayers === 2) && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
		console.log('\t<-- Testing Environment: 10 player game, res in console -->');
		var players = new ArrayList;
		for(var i = 0; i < 10; i++){
			var tempPlayer = balance.createPlayer('Player ' + i, i);
			console.log('DEBUG: @findPlayersStart, tempPlayer =', tempPlayer);
			players.add(tempPlayer);
		}
		var result = balance.initializePlayers(players, dbpw); // Initialize balancing, return result
		// Show result to discord users
		
		//message.channel.send(result);
	} else{
		console.log('Currently only support games for 4, 6, 8 and 10 players'); // TODO, support more sizes
	}
}

function print(messageVar, message){
	console.log(message);
	messageVar.channel.send(message);
}

exports.setStage = function(value){
	stage = value;
}

exports.printMessage = function(message){
	print(glblMessage, message);
}

