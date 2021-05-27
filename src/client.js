const Discord = require('discord.js');
const { getConfig } = require('./tools/load-environment');

let client;

// Get Instance of discord client
exports.getClient = async (name, callbackReady = noop, callbackLogin = noop) => {

  if (client)
    client.destroy();
  client = new Discord.Client();
  client.on('ready', async () => {
    console.log('ready to rumble -', name);
  });
  
  const { token } = getConfig();
  
  // Login
  const loginString = await client.login(token);
  // console.log('client:', name, '- Post login', loginString);

  // Call Callback
  await callbackReady();
  callbackLogin(client);
  // console.log('@getClient Return Promise<Client>')
  return client;
}

exports.getClientReference = () => client;

const generalId = '102097104322711552'; // General
const testId = '424309421519142913';  	// robot-playground

exports.getTextTestChannel = () => testId;
exports.getTextGeneralChannel = () => generalId;

exports.getTextChannel = (channelId = testId) => {
  // console.log('Client:', client);
  return client.channels.fetch(channelId);
}

exports.getChannels = () => {
  return client.channels;
}

const noop = () => {};