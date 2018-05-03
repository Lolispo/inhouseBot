const Discord = require('discord.js');

// Get Instance of discord client
const client = new Discord.Client();

//get config data
const conf = require("./conf.json");
const token = conf.token;
// will only do stuff after it's ready
client.on('ready', () => {
  console.log('ready to rumble');
});

client.on('message', message => {
  console.log("MSG: ", message.content);
  if(message.content == 'hej'){
    message.channel.send('lul')
  }
});

//Create more events to do fancy stuff with discord API

//login
client.login(token);
