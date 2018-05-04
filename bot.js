'use strict';

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

const ArrayList = require('arraylist');
const balance = require('./balance');

//get config data
const { prefix, token } = require('./conf.json');

/*
	TODO: 
		Better Printout / message to clients (Currently as message, but not nice looking) (Deluxe: maybe image if possible)
		better names for commands

	Deluxe: 
		Move players into separate channels on team generation
		Remove player written message after a couple of seconds (at least for testing purpose) to prevent chat over flooding
*/

// will only do stuff after it's ready
client.on('ready', () => {
	console.log('ready to rumble');
});

client.on('message', message => {
	console.log('MSG: ', message.content);
	if(message.content == 'hej'){
		message.channel.send('lul')
	}
	if(message.content === prefix+'ping'){
		console.log('PingAlert, user had !ping as command');
		message.channel.send('Pong');
	}
	if(message.content === `${prefix}active`){
		var channels = message.guild.channels;
		//console.log(message); // Can print for information about hierarchy in discord message
		channels.forEach(function(channel, id) {
			if(channel.type === 'voice'){
				console.log('VoiceChannel', channel.name, ' (id =',channel.id,') active users: (Total: ', channel.members.size ,')');
				var correctChannel = false;
				var playerInformation = new ArrayList;
				channel.members.forEach(function(members){
					if(!members.bot){ // Only real users
						console.log('\t', members.user.username, '(', members.user.id, ')'); // Printar alla activa users i denna voice chatt
						playerInformation.add({id : members.user.id, userName : members.user.userName});
						if(members.id === message.author.id){ // Same voice channel as the author of the message
							correctChannel = true;
						}
					}
				});
				if(correctChannel){ // Act on this channel if it is correct one
					console.log('Go to test: ', playerInformation.size(), message.author.username);
					if(playerInformation.size() == 10){// Check amount of users
						// initalize 10 Player objects with playerInformation
						var players = new ArrayList;
						for(var i = 0; i < playerInformation.size(); i++){
							var tempPlayer = balance.createPlayer(playerInformation[i].userName, playerInformation[i].id);
							players.add(tempPlayer);
						}
						var result = balanceTeams(players); // Initialize balancing, return result
						// Show result to discord users
						message.channel.send(result);
					} else if(playerInformation.size() === 1 && (message.author.username === 'Petter' || message.author.username === 'Obtained') ){
						console.log('Testing Environment: Generating 10 players with default mmr to balance');
						var players = new ArrayList;
						for(var i = 0; i < 10; i++){
							var tempPlayer = balance.createTempPlayer('Player ' + i, i, 900 + ( Math.floor(Math.random() * Math.floor(200))) );
							//console.log('DEBUG: @!active, player[' + i + '] =', tempPlayer);
							players.add(tempPlayer);
						}
						var result = balance.balanceTeams(players); // Initialize balancing, return result
						// Show result to discord users

						players = new ArrayList;
						for(var i = 0; i < 8; i++){
							var tempPlayer = balance.createTempPlayer('Player ' + i, i, 900 + ( Math.floor(Math.random() * Math.floor(200))) );
							//console.log('DEBUG: @!active, player[' + i + '] =', tempPlayer);
							players.add(tempPlayer);
						}
						var result = balance.balanceTeams(players);

						players = new ArrayList;
						for(var i = 0; i < 6; i++){
							var tempPlayer = balance.createTempPlayer('Player ' + i, i, 900 + ( Math.floor(Math.random() * Math.floor(200))) );
							//console.log('DEBUG: @!active, player[' + i + '] =', tempPlayer);
							players.add(tempPlayer);
						}
						var result = balance.balanceTeams(players);

						players = new ArrayList;
						for(var i = 0; i < 4; i++){
							var tempPlayer = balance.createTempPlayer('Player ' + i, i, 900 + ( Math.floor(Math.random() * Math.floor(200))) );
							//console.log('DEBUG: @!active, player[' + i + '] =', tempPlayer);
							players.add(tempPlayer);
						}
						var result = balance.balanceTeams(players);

						//message.channel.send(result);
					} else{
						console.log('Currently only support 10 players'); // TODO, support more sizes
					}
				}
			}
		})
	}

	// TODO Feat: Add functionality to remove player written message after ~5 sec, prevent flooding

});

//Create more events to do fancy stuff with discord API


//login
client.login(token);