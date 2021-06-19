import { Client } from "discord.js";
import { getTextTestChannel } from "./channels/channels";

import * as Discord from 'discord.js';
import { getConfig } from './tools/load-environment';
import * as util from 'util';

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
  // console.log('@getClient Return Promise<Client>:', util.inspect(client, {showHidden: false, depth: null}));
  return client;
};

export const getClientReference = () => client;

export const getTextChannel = async (channelId: string = getTextTestChannel()): Promise<Discord.Channel> => {
  // console.log('Client:', client);
  return client.channels.fetch(channelId);
}


export const getChannels = () => client.channels;

export const noop = () => {};
