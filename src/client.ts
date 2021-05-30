import { Client } from "discord.js";
import { getTextTestChannel } from "./channels/channels";

import * as Discord from 'discord.js';
import { getConfig } from './tools/load-environment';

const client = new Discord.Client();

// Get Instance of discord client
export const getClient = async (name, callbackReady: Function = noop, callbackLogin: Function = noop): Promise<Client> => {
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

export const getTextChannel = (channelId = getTextTestChannel()) => {
  // console.log('Client:', client);
  client.channels.fetch(channelId);
}


export const getChannels = () => client.channels;

export const noop = () => {};
