'use strict';

const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

//get config data
const { prefix, token } = require('./conf.json');
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
  	channels.forEach(function(channel, id) {
	   if(channel.type === "voice"){
	   		console.log("VoiceChannel", channel.name, " (id =",channel.id,") active users: (Total: ", channel.members.size ,")");
	   		channel.members.forEach(function(members){
	   			if(!members.bot){ // Får endast riktiga users
					console.log("\t", members.user.username, "(", members.user.id, ")"); // Printar alla activa users i denna voice chatt
	   			}
	   		});
	   }
	})
  }
});

//Create more events to do fancy stuff with discord API


//login
client.login(token);

