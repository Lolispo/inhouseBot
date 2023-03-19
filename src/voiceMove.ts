
// Author: Petter Andersson and Robert Wörlund

// Handles changing voice channel logic for users: unite and split methods

import { ChannelType, GuildBasedChannel, GuildChannel, GuildMember, Message, VoiceChannel } from 'discord.js';
import { IKosaTuppChannels } from './channels/channels';
import * as f from './tools/f';

let splitChannel: VoiceChannel;		// Channel we split in latest

const moveUsers = (fromChannels: GuildChannel[], toChannel) => {
  try {
    fromChannels.forEach(fromChannel => {
      setMemberVoice(fromChannel.members, toChannel);
    });
  } catch (e) {
    console.error('@unite Issue moving users');
  }
}

export const unite = (message: Message, options: string[], activeMembers: GuildMember[]) => {
  const channel = getVoiceChannel(message, options);
  console.log('DEBUG unite on channel', channel.name); // TODO Check if work as wanted
  if (f.isUndefined(activeMembers)) {
    console.log('Error: activeMembers not initialized in @unite (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
  } else {
    const guildChannels = message.guild.channels;
    const { channel1, channel2 } = getInhouseChannels(guildChannels);
    moveUsers([channel1, channel2], channel);
    setTimeout(() => {
      moveUsers([channel1, channel2], channel);
    }, 5000)
  }
};

export const uniteAll = (message: Message, options: string[]) => {
  return unite(message, options, []);
};

/**
 * 
 * @param guildChannels 
 * @returns 
 */
const getInhouseChannels = (guildChannels) => {
  // Find channels to swap to -> Change conditions for other desired channels or to randomly take 2
  // Currently hardcoded 'Team1' and 'Team2'
	const channel1: GuildChannel = guildChannels.cache.get(IKosaTuppChannels.Team1);
	const channel2: GuildChannel = guildChannels.cache.get(IKosaTuppChannels.Team2);
  return { channel1, channel2 };
}

export const split = (message: Message, options: string[], balanceInfo, activeMembers: GuildMember[]) => {
  const guildChannels = message.guild.channels;
  splitChannel = message.guild.members.cache.get(message.author.id)?.voice?.channel as VoiceChannel;

  // Get team players as GuildMember objects
  const t1players = f.teamToGuildMember(balanceInfo.team1, activeMembers); // Might give empty on test case (activeMember == undefined)
  const t2players = f.teamToGuildMember(balanceInfo.team2, activeMembers);

  const { channel1, channel2 } = getInhouseChannels(guildChannels);

  // const channel1 = guildChannels.cache.find(channel => channel[1].name === );
  // const channel2 = guildChannels.cache.find(channel => channel[1].name === );
  if (!f.isUndefined(channel1) && !f.isUndefined(channel2)) {
    setMemberVoice(t1players, channel1.id);
    setMemberVoice(t2players, channel2.id);
  } else {
    f.print(message, 'Channels: Team1 & Team2 does not exist');
    // TODO: Choose two random voice channels available as long as total EMPTY voiceChannels > 2
    // 			else: Create 'Team1' and 'Team2' voice channel for server in its own voicechannel-category called Inhouse
    // 		guild.createChannel
  }
};

// Set VoiceChannel for an array of GuildMembers
export const setMemberVoice = async (team, channelId): Promise<void> => {
  const listOfErrors = (await Promise.all(team.map(async (player) => {
    // Had issues throwing errors inside so instead threw on toplevel
    try {
      await player?.voice?.setChannel(channelId); // Will throw error if player is not in a voice channel
    } catch (e) {
      console.error('Issue moving users voice channel (User might not be connected to voice):', e.name);
      return e;
    }
  }))).filter(el => el); // Remove void returns, get only errors
  if (listOfErrors.length > 0)
    throw listOfErrors;
}

// Return voice channel for uniting
export const getVoiceChannel = (message: Message, options: string[], preferredChannelId?: string): GuildChannel => {
  // Get correct channel
  let channel1: GuildChannel;

  if (preferredChannelId) {
    const preferredChannel = message.guild.channels.cache.get(preferredChannelId) as VoiceChannel;
    if (preferredChannel)
      return preferredChannel;
  }

  if (options.length > 1) {
    const channelName = options.length > 2 ? options.slice(1).join(' ') : options[1];
    console.log('channelName:', channelName);
    const tempChannel = message.guild.channels.cache.find((channel: GuildBasedChannel) => {
      console.log(channel.name, channel.type, channelName, channel.type === ChannelType.GuildVoice && channel.name === channelName);
      return channel.type === ChannelType.GuildVoice && channel.name.toLowerCase() === channelName && channel.id !== message.guild.afkChannelId;
    });
    if (tempChannel) {
      channel1 = tempChannel as VoiceChannel
      return channel1; // If param is given and gives a valid channel use that
    }
  }

  // Otherwise use same voiceChannel as we split in if its empty
  console.log('@DEBUG splitChannel:', splitChannel?.members.size);
  if (!channel1 && splitChannel && splitChannel.members.size === 0) { 
    return splitChannel;
  }

  // Use default unite location - Landing zone
  channel1 = message.guild.channels.cache.get(IKosaTuppChannels.LandingZone) as VoiceChannel;
  if (channel1 && channel1.members.size === 0) return channel1;

  // If this is not defined, take own own voiceChannel or an available one
  // Can't be the AFK channel
  channel1 = message.guild.members.cache.get(message.author.id)?.voice?.channel;
  if (!channel1 || channel1.id === message.guild.afkChannelId) {
     const tempChannel = message.guild.channels.cache.find(channel => channel.type === ChannelType.GuildVoice && channel.id !== message.guild.afkChannelId);
     channel1 = tempChannel as VoiceChannel;
  }
  // console.log('DEBUG @getVoiceChannel: Channel chosen for unite (not param or splitChannel):', channel1.name);
  return channel1;
}
