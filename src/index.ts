import { Message, MessageReaction, User } from "discord.js";
import { discordEventMessage, discordEventReactionAdd, discordEventReactionRemove } from "./bot";
import { getClient } from "./client";
import { initializeDBSequelize } from "./database/db_sequelize";
import { getConfig } from "./tools/load-environment";

// Initialize Client
getClient('bot', async () => initializeDBSequelize(getConfig().db), (client) => {
	// Listener on message
	client.on('message', (message: Message) => discordEventMessage(message));

	// Listener on reactions added to messages
	client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) => discordEventReactionAdd(messageReaction, user));

	// Listener on reactions removed from messages
	client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User) => discordEventReactionRemove(messageReaction, user));

	client.on('error', console.error);
});