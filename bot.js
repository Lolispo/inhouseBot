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
  if(message.content === `${prefix}ping`){
  	console.log('PingAlert, user had !ping as command');
  	message.channel.send('Pong');
  }
});

//Create more events to do fancy stuff with discord API

//login
client.login(token);
