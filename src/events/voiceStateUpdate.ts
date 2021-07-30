import { VoiceState } from "discord.js";
import { IKosaTuppChannels } from "../channels/channels";
import { QueueAction } from "../commands/game/queue/queue";

export const discordVoiceStateUpdate = (oldState: VoiceState, newState: VoiceState) => {
  // console.log('@discordVoiceStateUpdate OLD:', oldState); 
  // console.log('@discordVoiceStateUpdate NEW:', newState);

  // TODO: Implement detection of that someone has joined the waiting room channel

  // Has changed channel to waiting room
  if (newState.channelID === IKosaTuppChannels.WaitingRoomChannel && oldState.channelID !== IKosaTuppChannels.WaitingRoomChannel) {
    // Someone has joined the channel
    const user = newState.member.user;

    // TODO: Load a messageVariable so we can send message in channel
    QueueAction.instance.addPlayerToQueue(user); // TODO: Message second parameter
  } 
}