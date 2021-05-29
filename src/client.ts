const Discord = require('discord.js');
const { getConfig } = require('./tools/load-environment');

const client = new Discord.Client();

// Get Instance of discord client
export const getClient = async (name, callbackReady = noop, callbackLogin = noop) => {
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
};

export const getClientReference = () => client;

const generalId = '102097104322711552'; // General
const testId = '424309421519142913'; // robot-playground

export const getTextTestChannel = () => testId;
export const getTextGeneralChannel = () => generalId;

export const getTextChannel = (channelId = testId) =>
  // console.log('Client:', client);
  client.channels.fetch(channelId);


export const getChannels = () => client.channels;

const noop = () => {};