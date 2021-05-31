
// Author: Petter Andersson and Robert Wörlund

// Handles changing voice channel logic for users: unite and split methods

import { GuildChannel, GuildMember, Message, VoiceChannel } from 'discord.js';
import { IKosaTuppChannels } from './channels/channels';
import * as f from './tools/f';

let splitChannel: VoiceChannel;		// Channel we split in latest

export const unite = function (message: Message, activeMembers: GuildMember[]) {
  const channel = getVoiceChannel(message);
  console.log('DEBUG unite on channel', channel.name); // TODO Check if work as wanted
  if (f.isUndefined(activeMembers)) {
    console.log('Error: activeMembers not initialized in @unite (Test case = ok)'); // Since it is assumed to always be initialized, throw error otherwise
  } else {
    activeMembers.forEach((member) => {
      // As long as they are still in some voice chat
      if (!f.isUndefined(member.voice.channel)) {
        try {
          member.voice.setChannel(channel);
        } catch (e) {
          console.error('Error moving user by unite command:', member.user.username, e);
        }
      }
    });
  }
};

export const uniteAll = (message: Message) => {
  const channel = getVoiceChannel(message);
  // TODO: Find all users active in a voiceChannel, currently iterates over all members of guild
  // client.voiceConnections, doesnt seem to exist
  console.log('DEBUG uniteAll', channel.name);
  message.guild.members.cache.forEach((member) => {
    // As long as they are still in some voice chat
    if (!f.isUndefined(member.voice.channel) && member.voice.channelID !== message.guild.afkChannelID) { // As long as user is in a voiceChannel (Should be)
      console.log('@unitAll DEBUG:', member.user.username, member.voice.channelID);
      try {
        member.voice.setChannel(channel);
      } catch (e) {
        console.error('Error moving user by unite command:', member.user.username, e);
      }
    }
  });
};

export const split = (message: Message, balanceInfo, activeMembers: GuildMember[]) => {
  const guildChannels = message.guild.channels;
  splitChannel = message.guild.member(message.author).voice.channel;

  // Get team players as GuildMember objects
  const t1players = f.teamToGuildMember(balanceInfo.team1, activeMembers); // Might give empty on test case (activeMember == undefined)
  const t2players = f.teamToGuildMember(balanceInfo.team2, activeMembers);

  // Find channels to swap to -> Change conditions for other desired channels or to randomly take 2
  // Currently hardcoded 'Team1' and 'Team2'
	const channel1: GuildChannel = guildChannels.cache.get(IKosaTuppChannels.Team1);
	const channel2: GuildChannel = guildChannels.cache.get(IKosaTuppChannels.Team2);
  // const channel1 = guildChannels.cache.find(channel => channel[1].name === );
  // const channel2 = guildChannels.cache.find(channel => channel[1].name === );
  if (!f.isUndefined(channel1) && !f.isUndefined(channel2)) {
    setTeamVoice(t1players, channel1.id);
    setTeamVoice(t2players, channel2.id);
  } else {
    f.print(message, 'Channels: Team1 & Team2 does not exist');
    // TODO: Choose two random voice channels available as long as total EMPTY voiceChannels > 2
    // 			else: Create 'Team1' and 'Team2' voice channel for server in its own voicechannel-category called Inhouse
    // 		guild.createChannel
  }
};

// Set VoiceChannel for an array of GuildMembers
const setTeamVoice = (team, channelId) => {
  team.forEach((player) => {
    player.voice.setChannel(channelId);
  });
}

// Return voice channel for uniting
function getVoiceChannel(message) {
  // Get correct channel
  const res = message.content.split(' ');
  let channel1;

  if (res.length > 1) {
    const channelName = res.length > 2 ? res.slice(1).join(' ') : res[1];
    console.log('channelName:', channelName);
    channel1 = message.guild.channels.cache.find((channel) => {
      console.log(channel.name, channel.type, channelName, channel.type === 'voice' && channel.name === channelName);
      return channel.type === 'voice' && channel.name.toLowerCase() === channelName && channel.id !== message.guild.afkChannelID;
    });
  }
  if (!f.isUndefined(channel1)) { // If param is given use that
    return channel1;
  } if (f.isUndefined(channel1) && !f.isUndefined(splitChannel)) { // Otherwise use same voiceChannel as we split in
    return splitChannel;
  }
  // If this is not defined, take own own voiceChannel or an available one
  channel1 = message.guild.member(message.author).voiceChannel;

  // console.log('DEBUG: getVoiceChannel', channel1);
  if (f.isUndefined(channel1) || channel1.id === message.guild.afkChannelID) {
    channel1 = message.guild.channels.cache.find(channel => channel.type === 'voice' && channel.id !== message.guild.afkChannelID);
  }
  // console.log('DEBUG @getVoiceChannel: Channel chosen for unite (not param or splitChannel):', channel1.name);
  return channel1;
}
