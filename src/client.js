const Discord = require('discord.js');
const { getConfig } = require('./tools/load-environment');

const client = new Discord.Client();

// Get Instance of discord client
exports.getClient = async (name, callbackReady = noop, callbackLogin = noop) => {

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

const noop = () => {};