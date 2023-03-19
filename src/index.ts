import { Message, MessageReaction, User, VoiceState } from "discord.js";
import { discordEventMessage, discordEventReactionAdd, discordEventReactionRemove } from "./bot";
import { getClient } from "./client";
import { initializeDBSequelize } from "./database/db_sequelize";
import { discordVoiceStateUpdate } from "./events/voiceStateUpdate";
import { getConfig } from "./tools/load-environment";

// Initialize Client
getClient('bot', async () => initializeDBSequelize(getConfig().db), (client) => {
	// Listener on message
	console.log('Initializing listeners ...');

	client.on('messageCreate', (message: Message) => discordEventMessage(message));

	// Listener on reactions added to messages
	client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) => discordEventReactionAdd(messageReaction, user));

	// Listener on reactions removed from messages
	client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User) => discordEventReactionRemove(messageReaction, user));

	client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => discordVoiceStateUpdate(oldState, newState));

	client.on('error', console.error);

	process.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection:', error);
	});
});