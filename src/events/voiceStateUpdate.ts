import { VoiceState } from "discord.js";
import { IKosaTuppChannels } from "../channels/channels";
import { QueueAction } from "../commands/game/queue/queue";

// Has changed channel to waiting room
const waitingRoomJoinQueue = (oldState: VoiceState, newState: VoiceState) => {
  if (newState.channelID === IKosaTuppChannels.WaitingRoomChannel && oldState.channelID !== IKosaTuppChannels.WaitingRoomChannel) {
    // Someone has joined the channel
    const user = newState.member.user;

    // TODO: Load a messageVariable so we can send message in channel
    // Currently sends no message except direct message that you joined queue
    QueueAction.instance.addPlayerToQueue(user);
  } 
}

/*
const channelsToUpdateNameFor: IKosaTuppChannels[] = [
  IKosaTuppChannels.LandingZone,
  IKosaTuppChannels.WaitingRoomChannel
]

const changeChannelName = (wasJoinEvent: boolean, channelEnum: IKosaTuppChannels, oldState: VoiceState, newState: VoiceState) => {
  const channel = newState.guild.channels.cache.find((channel) => channel.id === (wasJoinEvent ? newState : oldState).channelID);
  const members = channel.members;
  const amount = members.size;
  const baseNameChannel = KosaTuppChannelObjects[channelEnum].name;
  const newName = baseNameChannel + (amount > 0 ? ' ' + amount : '');
  console.log('@changeChannelNameUserUpdate newName:', newName, amount, baseNameChannel, channelEnum);
  try {
    channel.setName(newName);
  } catch (e) {
    console.error('Issue changing name:', e);
  }
}

const changeChannelNameUserUpdate = (oldState: VoiceState, newState: VoiceState) => {
  // Join event
  for (let i = 0; i < channelsToUpdateNameFor.length; i++) {
    // Join or leave
    if (newState.channelID === channelsToUpdateNameFor[i] && oldState.channelID !== channelsToUpdateNameFor[i]) {
      changeChannelName(true, channelsToUpdateNameFor[i], oldState, newState);
    } else if (newState.channelID !== channelsToUpdateNameFor[i] && oldState.channelID === channelsToUpdateNameFor[i]) {
      changeChannelName(false, channelsToUpdateNameFor[i], oldState, newState);
    }
    // Shouldn't break until both join and leave event have been executed
  }
}
*/

export const discordVoiceStateUpdate = (oldState: VoiceState, newState: VoiceState) => {
  waitingRoomJoinQueue(oldState, newState);
  // changeChannelNameUserUpdate(oldState, newState);
}