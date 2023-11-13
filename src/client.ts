import { getTextTestChannel } from "./channels/channels";

import { Client, GatewayIntentBits, Channel, Partials } from 'discord.js';
import { getConfig } from './tools/load-environment';

const client = new Client({

  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.Reaction,
  ]
});

// Get Instance of discord client
export const getClient = async (name, callbackReady: Function = noop, callbackLogin: Function = noop): Promise<Client> => {
  client.on('ready', async () => {
    console.log('ready to rumble -', name);
  });

  const { token } = getConfig();

  // Login
  await client.login(token);
  // console.log('client:', name, '- Post login');

  // Call Callback
  await callbackReady();
  callbackLogin(client);
  // console.log('@getClient Return Promise<Client>:'); // , util.inspect(client, {showHidden: false, depth: null}));
  return client;
};

export const getClientReference = () => client;

export const getTextChannel = async (channelId: string = getTextTestChannel()): Promise<Channel> => {
  // console.log('Client:', client);
  return client.channels.fetch(channelId);
}


export const getChannels = () => client.channels;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
