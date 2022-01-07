'use strict';
// Author: Petter Andersson

// Main File for discord bot: Handles event for messages

import { callbackInvalidCommand } from './tools/f';							
import * as f from './tools/f'; // Function class used by many classes, ex. isUndefined, messagesDeletion
import * as mmr_js from './game/mmr';						// Handles balanced mmr update
import { createPlayer, Player } from './game/player';					// Handles player storage in session, the database in action
import * as map_js from './mapVeto';					// MapVeto system
import * as voiceMove_js from './voiceMove'; 			// Handles moving of users between voiceChannels
import * as db_sequelize from './database/db_sequelize';			// Handles communication with db
import { getChannelName, getGameOnGoing, isCorrect, startGame } from './trivia';						// Trivia
import { Game, getGame, createGame, hasActiveGames, deleteGame } from './game/game';
import { getConfig } from './tools/load-environment';
import { getClientReference } from './client';
// import * as birthday from './birthday';
import { connectSteamEntry, validateSteamID, sendSteamId, setSteamId } from './steamid';
import { cleanOnGameEnd } from './game/game';
import { getGameStats } from './csserver/cs_server_stats';

import { GuildMember, Message, MessageReaction, ReactionUserManager, TextChannel, User, VoiceChannel } from 'discord.js';
import { triviaStartCommand } from './commands/trivia/triviaCommand';
import { pingAction } from './commands/memes/ping';
import { statsAction } from './commands/stats/stats';
import { GameModesType, getAllModes, getGameModes, getGameModes1v1, getModeAndPlayers } from './game/gameModes';
import { getAllDmCommands } from './BaseCommand/mainCommand';
import { startsWith } from './BaseCommand/BaseCommand';
import { getAdminUids, IMessageType } from './BaseCommand/BaseCommandTypes';
import { handleMessageBaseCommand } from './BaseCommand/BaseCommandHandler';

const { prefix } = getConfig(); // Load config data from env

const emoji_agree = '👌'; 		// Agree emoji. Alt: 👍, Om custom Emojis: Borde vara seemsgood emoji
const emoji_disagree = '👎';	// Disagree emoji. 
const emoji_error = '❌'; 		// Error / Ban emoji. Alt: '🤚';

const bot_name = 'inhouse-bot';
const voteText = '**Majority of players that played the game need to confirm this result (Press ' + emoji_agree + ' or ' + emoji_disagree + ')**';
export const removeBotMessageDefaultTime = f.getDefaultRemoveTime() || 60000; // 300000
const maxPlayers = 14;

const balanceCommands = [prefix + 'go', prefix + 'game', prefix + 'b', prefix + 'balance', prefix + 'balancegame', prefix + 'inhousebalance'];
const team1wonCommands = [prefix + 'team1won'];
const team2wonCommands = [prefix + 'team2won'];
const tieCommands = [prefix + 'tie', prefix + 'draw'];
const cancelCommands = [prefix + 'c', prefix + 'cancel', prefix + 'gamenotplayed'];
const uniteAllCommands = [prefix + 'ua', prefix + 'uniteall'];
const mapvetostartCommands = [prefix + 'mapveto', prefix + 'startmapveto', prefix + 'mapvetostart', prefix + 'startmaps'];
const triviaCommands = [prefix + 'trivia', prefix + 'starttrivia', prefix + 'triviastart'];
const triviaModesCommands = [prefix + 'modestrivia', prefix + 'helptrivia'];
const statsCommands = [prefix + 'stats'];
const exitCommands = [prefix + 'exit', prefix + 'clear', prefix + 'e'];
const pingCommands = [prefix + 'ping'];
const connectSteamCommands = [prefix + 'connectsteam', prefix+'connectsteamid'];
const steamidCommands = [prefix + 'getsteamid', prefix + 'steamid'];
const getMatchResultCommand = [prefix + 'getresult', prefix + 'getmatchresult'];
const playerStatusCommands = [prefix + 'playersstatus'];

// Handle Discord Event Message
export const discordEventMessage = (message: Message) => {
	if (!message.author.bot && message.author.username !== bot_name) { // Message sent from user
		const isTextChannel = (message.channel as TextChannel).guild;
		if (isTextChannel) {
			const textChannel = message.channel as TextChannel;
			message.content = message.content.toLowerCase(); // Allows command to not care about case
			if (textChannel.name === getChannelName() && getGameOnGoing()) { 
				// Check if a message is sent in trivia channel when game is on going
				isCorrect(message);
			} else {
				console.log('< MSG (' + textChannel.guild.name + '.' + textChannel.name + ') ' + message.author.username + ':', message.content); 
				handleMessage(message); // Someone wrote in channel
			}
		} else { // Direct Message to Bot
			console.log('DM msg = ' + message.author.username + ': ' + message.content);
			const options = message.content.split(' ');

			const result = handleMessageBaseCommand(message, options, IMessageType.DIRECT_MESSAGE);
			if (!result) return; // Breaks if a valid command was given

			let validProfileMode;

			if (startsWith(message, statsCommands)){
				statsAction(message, options);
			} else if (connectSteamCommands.includes(message.content)) {
				connectSteamEntry(message);
			} else if (validProfileMode = validateSteamID(message.content)) {
				setSteamId(message, validProfileMode);
			} else if (steamidCommands.includes(message.content)) {
				sendSteamId(message);
			} else {
				const dmCommands = getAllDmCommands();
				message.author.send(`Send commands in a server - not to me!\nAllowed commands here are: **[${dmCommands.join(', ')}]**\n`)
				.then(result => {
					f.deleteDiscMessage(result, 10000, 'sendDMMessage');
				});
			}
		}
	} // Should handle every message except bot messages
}

// Handle Discord Event Reaction Add
export const discordEventReactionAdd = (messageReaction: MessageReaction, user: User) => {
	if (!user.bot && hasActiveGames()){ // Bot adding reacts doesn't require our care
		// Reacted on voteMessage
		//console.log('DEBUG: @messageReactionAdd by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
		const gameObject = getGame(user);
		// Check if emojiReaction is on voteMessage, voteMessage != undefined
		if (!f.isUndefined(gameObject) && !f.isUndefined(gameObject.getVoteMessage()) && messageReaction.message.id === gameObject.getVoteMessage().id){
			voteMessageReaction(messageReaction, gameObject);
		} else { // TODO Game: Check 
			// console.log('@messageReactionAdd', messageReaction.emoji.name);
			//const gameObjectMapMessage = game_js.getGameMapMessages(messageReaction);
			//if(!f.isUndefined(gameObjectMapMessage)){ // Reacted on a messageReaction
			if (!f.isUndefined(gameObject)) {
				// const gameMapMessages = gameObject.getMapMessages();
				const mapMessage = gameObject.getMapMessages().find(function(mapMsg){
					return messageReaction.message.id === mapMsg.id
				});
				if (!f.isUndefined(mapMessage)) {
					console.log('@messageReactionAdd Found message.id', mapMessage?.id, user.username)
					if (messageReaction.emoji.toString() === emoji_error){
						map_js.captainVote(messageReaction, user, mapMessage, gameObject);
					} else if (messageReaction.emoji.toString() === emoji_agree){ // If not captains, can only react with emoji_agree or emoji_disagree
						map_js.otherMapVote(messageReaction, user, gameObject.getActiveMembers());
					} else if (messageReaction.emoji.toString() === emoji_disagree){ // If not captains, can only react with emoji_agree or emoji_disagree
						map_js.otherMapVote(messageReaction, user, gameObject.getActiveMembers());
					}
				}
			} else {
				console.log('ERROR: Map messages are undefined')
			}
			// React on something on an active game
		}
		// React on something not connected to activeGames
	}
}

// Handle Discord Event Reaction Remove
export const discordEventReactionRemove = (messageReaction, user) => {
	if (!user.bot){
		if (hasActiveGames()) {
			// React removed on voteMessage
			//console.log('DEBUG: @messageReactionRemove by', user.username, 'on', messageReaction.message.author.username + ': ' + messageReaction.message.content, messageReaction.count);
			const gameObject = getGame(user);
			// Check if emojiReaction is on voteMessage, voteMessage != undefined
			if (!f.isUndefined(gameObject) && !f.isUndefined(gameObject.getVoteMessage()) && messageReaction.message.id === gameObject.getVoteMessage().id){
				voteMessageTextUpdate(messageReaction, gameObject);
			}
			// React removed on something else
		}
	}
}

// Create more events to do fancy stuff with discord API
let currentTeamWonGameObject; // TODO: Refactor usage to use global scope in better way

export const handleMessageExported = (message) => handleMessage(message);

// Main message handling function 
const handleMessage = async (message: Message) => {
	const options = message.content.split(' ');

	const result = handleMessageBaseCommand(message, options);
	if (!result) return; // Breaks if a valid command was given

	// All stages commands, Commands that should always work, from every stage
	if (!startsWith(message, prefix)){ // Every command after here need to start with prefix
		return;
	}
	else if (pingCommands.includes(message.content)){ // Good for testing prefix and connection to bot
		pingAction(message, options);
	}
	else if (connectSteamCommands.includes(message.content)) {
		connectSteamEntry(message);
	}
	else if (steamidCommands.includes(message.content)) {
		sendSteamId(message);
	}
	// Start game, through balance or Duel, balance for 2 players
	else if (startsWith(message, balanceCommands)){
		balanceCommand(message, options);
	}
	
	else if (startsWith(message, triviaCommands)){
		triviaStartCommand(message, options);
	}

	// Trivia modes - gives list of categories
	else if (triviaModesCommands.includes(message.content)){
		message.author.send(buildTriviaHelpCommands())
		.then(result => {
			f.deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
		});
		f.deleteDiscMessage(message, 10000, 'triviaModes');
	}

	// Sends private information about your statistics
	else if (startsWith(message, statsCommands)){
		statsAction(message, options);
		f.deleteDiscMessage(message, 15000, 'stats');
	}

	// Used for tests
	else if (exitCommands.includes(message.content)){
		if (getAdminUids().includes(message.author.id)){
			// Do tests:
			cleanupExit();
		}
		f.deleteDiscMessage(message, 1, 'exit');
	}
	// Unites all channels, INDEPENDENT of game ongoing
	// Optional additional argument to choose name of voiceChannel to uniteIn, otherwise same as balance was called from
	else if (startsWith(message, uniteAllCommands)){
		voiceMove_js.uniteAll(message, options);
		f.deleteDiscMessage(message, 15000, 'ua');
	} 
	// Active Game commands: (After balance is made)
	else if (isActiveGameCommand(message)) {
		const gameObject = getGame(message.author);
		if (gameObject) {
			gameObject.updateFreshMessage(message);
			if (team1wonCommands.includes(message.content)) {
				const activeResultVote = gameObject.getTeamWon(); // team1Won crash
				if (activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0) {
					if (activeResultVote != 0) {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(1);
					currentTeamWonGameObject = gameObject;
					const teamName = gameObject.getBalanceInfo().team1Name;
					const totalNeeded = (gameObject.getBalanceInfo().team1.length + 1);
					f.print(message, `**${teamName} won!** ` + voteText + ' (0/' + totalNeeded + ')', callbackVoteText);
				}
			}
			else if (team2wonCommands.includes(message.content)) {
				const activeResultVote = gameObject.getTeamWon(); // not a function
				if (activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0){
					if (activeResultVote != 0){
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(2);
					currentTeamWonGameObject = gameObject;
					const teamName = gameObject.getBalanceInfo().team2Name;
					const totalNeeded = (gameObject.getBalanceInfo().team2.length + 1);
					f.print(message, `**${teamName} won!** ` + voteText + ' (0/' + totalNeeded + ')', callbackVoteText);
				}
			}
			else if (tieCommands.includes(message.content)){
				const activeResultVote = gameObject.getTeamWon();
				if (activeResultVote === 2 || activeResultVote === 1 || activeResultVote === 0){
					if (activeResultVote != 0){
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for team ' + activeResultVote, callbackInvalidCommand);
					} else {
						f.print(message, 'Invalid command: Active result vote for this game already ongoing, for a tie', callbackInvalidCommand);
					}
				} else {
					gameObject.setTeamWonMessage(message);
					gameObject.setTeamWon(0);
					currentTeamWonGameObject = gameObject;
					const totalNeeded = (gameObject.getBalanceInfo().team1.length + 1);
					f.print(message, `**Tie!** ` + voteText + ' (0/' + totalNeeded + ')', callbackVoteText);
				}
			}
			else if (cancelCommands.includes(message.content)){
				// Only creator of game or admin can cancel it
				const matchupMessage = gameObject.getMatchupMessage();
				if (message.author.id === matchupMessage.author.id || getAdminUids().includes(message.author.id)){
					f.print(message, 'Game cancelled', (message) => {
						f.deleteDiscMessage(message, 15000, 'gameCancelled');
						cleanOnGameEnd(gameObject);
					});
					f.deleteDiscMessage(message, 15000, 'c'); // prefix+c
				} else {
					f.print(message, 'Invalid command: Only the person who started the game can cancel it (' + matchupMessage.author.username + ')', callbackInvalidCommand);
				}
			}
	
			// mapVeto made between one captain from each team
			else if (mapvetostartCommands.includes(message.content)){
				const client = await getClientReference();
				console.log('mapvetoStart: Emojis:', client.emojis, client);
				map_js.mapVetoStart(message, gameObject, client.emojis);
				/*.then(result => {
					gameObject.setMapMessages(result);
				});*/
				f.deleteDiscMessage(message, 15000, 'mapveto'); // Remove mapVeto text
			}
			else if (getMatchResultCommand.includes(message.content)) {
				// Shouldn't be required anymore but good to have
				// If game stats exist but it wasn't detected automatically to check stats, use command
				const serverId = gameObject.getServerId();
				if (serverId) {
					getGameStats(serverId, gameObject);
				}
				f.deleteDiscMessage(message, 15000, 'getmatchresult');
			}
			// Cant reach this after game
			else if (playerStatusCommands.includes(message.content) && getAdminUids().includes(message.author.id)) {
				console.log('DEBUG playerStatusCommands', gameObject.getActiveMembers());
				f.deleteDiscMessage(message, 15000, 'playerStatusCommands');
			}
		} else {
			f.print(message, 'Invalid command: User ' + message.author.username + ' not currently in a game', callbackInvalidCommand);
		}
	}
	else if (startsWith(message, prefix)){ // Message start with prefix
		f.print(message, 'Invalid command: List of available commands at **' + prefix + 'help**', callbackInvalidCommand);
		f.deleteDiscMessage(message, 3000, 'invalidCommand'); // Overlaps delete call from callbackInvalidCommand above^
	}
}

// Returns true if message is an active game command
const isActiveGameCommand = (message) => {
	return (team1wonCommands.includes(message.content) || team2wonCommands.includes(message.content) || tieCommands.includes(message.content) ||
			cancelCommands.includes(message.content)
			|| mapvetostartCommands.includes(message.content) || getMatchResultCommand.includes(message.content) || 
			playerStatusCommands.includes(message.content));
}

async function cleanupExit(){
	await f.onExitDelete();
	await Game.getActiveGames().map(game => cleanOnGameEnd(game));
}

// Start trivia game, sent from trivia when questions are fetched. 
export const triviaStart = (questions, message, author) => {
	// Start game in text channel with these questions
	const voiceChannel: VoiceChannel = message.guild.member(message.author).voiceChannel;
	if (voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Sets initial player array to user in disc channel if available
		const players = findPlayersStart(voiceChannel);
		db_sequelize.initializePlayers(players, 'trivia', (playerList: Player[]) => {
			startGame(message, questions, playerList); 
		});
	} else { // No users in voice channel who wrote trivia
		db_sequelize.initializePlayers([createPlayer(author.username, author.id)], 'trivia', (playerList) => {
			startGame(message, questions, playerList); // Initialize players as one who wrote message
		});
	}
}

// Here follows starting balanced game methods

// Command used for starting a new game
async function balanceCommand(message, options){
	const gameObjectExist = getGame(message.author);
	if (f.isUndefined(gameObjectExist)){ // User is not already in a game
		console.log('@DEBUG', message.guild.member(message.author));
		const voiceChannel = message.guild.member(message.author)?.voice?.channel;
		// console.log('@voiceChannel:', voiceChannel);
		if (voiceChannel !== null && !f.isUndefined(voiceChannel)){ // Makes sure user is in a voice channel
			// Initialize Game object
			const gameObject = await createGame(message.id, message);
			if (!gameObject) console.error('GameObject Failed to initialize after creategame');
			const players: Player[] = findPlayersStart(voiceChannel, gameObject); // initalize players objects with playerInformation
			const numPlayers = players.length;
			// Initialize balancing, Result is printed and stage = 1 when done
			let allModes: GameModesType[] = getGameModes();
			if (numPlayers > 2 && numPlayers <= maxPlayers && numPlayers % 2 === 0){ // TODO: Allow uneven games? Requires testing to see if it works
				getModeAndPlayers(players, gameObject, { message, allModes }, options);
			} else if (numPlayers === 2){
				allModes = getGameModes1v1();
				getModeAndPlayers(players, gameObject, { message, allModes }, options);
			} 
			else {
				const amountVoiceChannel = voiceChannel.members.size;
				const stringAmountConnected = amountVoiceChannel !== numPlayers ? 
				`Loaded amount differ from connected in voice channel: ${amountVoiceChannel} in channel vs ${numPlayers} loaded` : 
				`Not supported: ${numPlayers}`;
				f.print(message, `Invalid amount of players in voicechannel: ${stringAmountConnected}`, callbackInvalidCommand);
				deleteGame(gameObject);
			}
		} else {
			console.log('DEBUG: Remove the one that is false from if: ' + (voiceChannel !== null) + ', ' + (!f.isUndefined(voiceChannel)));
			f.print(message, 'Invalid command: Author of message must be in voiceChannel', callbackInvalidCommand); 
		}
		f.deleteDiscMessage(message, 10000, 'channelMessage (callback adding "<removed>")', function(msg){ // Remove the message, but let is remain in memory?
			msg.content += '<removed>';
		});
	} else {
		f.print(message, 'Invalid command: ' + message.author.username + ' is already in a game (' + gameObjectExist.getGameID() + ')', callbackInvalidCommand); 
		console.log('Existing game object:', gameObjectExist);
		f.deleteDiscMessage(message, 10000, 'matchupMessage');
	}
}

const isNotBot = (member: GuildMember): boolean => {
	return !member.user.bot;
}

// Initialize players array from given voice channel
// activeGame set to true => for phases where you should prevent others from overwriting (not trivia)
const findPlayersStart = (channel: VoiceChannel, gameObject?: Game): Player[] => {
	const players: Player[] = [];
	const members: GuildMember[] = Array.from(channel.members.values()).filter(isNotBot);
	members.forEach((member) => {
		console.log('\t' + member.user.username + '(' + member.user.id + ')'); // Printar alla activa users (ej bots) i denna voice chat
		players.push(createPlayer(member.user.username, member.user.id));
	});
	if (gameObject) {
		gameObject.setActiveMembers(members); // TODO Game
	} else {
		console.error('ERROR Failed to setActive members sine gameObject is not initalized');
	}
	console.log(`VoiceChannel ${channel.name} (id = ${channel.id}) active users: (Total: ${channel.members.size}) ${players.length} Members: ${players.map(player => player.userName)}`);
	return players;
}

// Handling of voteMessageReactions
// TODO: Refactor the following three methods
// TODO Game: check for old variable usage, use from gameobject instead
function voteMessageReaction(messageReaction: MessageReaction, gameObject){
	// Check if majority number contain enough players playing
	if (messageReaction.emoji.toString() === emoji_agree){
		voteMessageTextUpdate(messageReaction, gameObject)
		.then(result => {
			handleRelevantEmoji(true, gameObject.getTeamWon(), messageReaction, result.amountRelevant, result.totalNeeded, gameObject);	
		});
	} else if (messageReaction.emoji.toString() === emoji_disagree){
		const amountRelevant = countAmountUsersPlaying(gameObject.getBalanceInfo().team1, messageReaction.users) + countAmountUsersPlaying(gameObject.getBalanceInfo().team2, messageReaction.users);
		const totalNeeded = (gameObject.getBalanceInfo().team1.length + 1);
		handleRelevantEmoji(false, gameObject.getTeamWon(), messageReaction, amountRelevant, totalNeeded, gameObject);
	}
}

// Updates voteMessage on like / unlike the agree emoji
// Is async to await the voteMessage.edit promise
async function voteMessageTextUpdate(messageReaction: MessageReaction, gameObject){
	const amountRel = await countAmountUsersPlaying(gameObject.getBalanceInfo().team1, messageReaction.users) + countAmountUsersPlaying(gameObject.getBalanceInfo().team2, messageReaction.users);
	const totalNeed = await (gameObject.getBalanceInfo().team1.length + 1);
	//console.log('DEBUG: @messageReactionAdd, count =', amountRelevant, ', Majority number is =', totalNeeded);
	const voteAmountString = ' (' + amountRel + '/' + totalNeed + ')';
	const winner = gameObject.getTeamWon();
	const teamNameWon = winner === 1 ? gameObject.getBalanceInfo().team1Name : winner === 2 ? gameObject.getBalanceInfo().team2Name : '';
	const teamWonMessage = winner === 0 ? '**Tie!** ' : `**${teamNameWon} won!** `;
	const newVoteMessage = (teamWonMessage + voteText + voteAmountString);
	const newVoteMessageVar = gameObject.getVoteMessage();
	newVoteMessageVar.content = newVoteMessage; 
	await newVoteMessageVar.edit(newVoteMessage);
	// await voteMessage.edit(newVoteMessage);
	gameObject.setVoteMessage(newVoteMessageVar); // Not needed if await on edit? TODO: Check
	return { amountRelevant: amountRel, totalNeeded: totalNeed }
}

// Handle relevant emoji
function handleRelevantEmoji(emojiConfirm, winner, messageReaction, amountRelevant, totalNeeded, gameObject){
	//console.log('DEBUG: @handleRelevantEmoji', amountRelevant, totalNeeded, emojiConfirm);
	if (amountRelevant === totalNeeded){
		if (emojiConfirm) {
			console.log(emoji_agree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			// Update mmr for both teams
			mmr_js.updateMMR(winner, gameObject, (message) => {
				console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
				f.deleteDiscMessage(message, removeBotMessageDefaultTime * 4, 'gameFinished');
				cleanOnGameEnd(gameObject);
			});
			//console.log('DEBUG CHECK ME: ARE THE TWO FOLLOWING THE SAME: ', messageReaction.message.content, voteMessage.content); // TODO Check: are these the same
			f.deleteDiscMessage(messageReaction.message, 3000, 'voteMessage');
			f.deleteDiscMessage(gameObject.getTeamWonMessage(), 3000, 'teamWonMessage');
		} else {
			console.log(emoji_disagree + ' CONFIRMED! ' + ' (' + amountRelevant + '/' + totalNeeded + ') Removing voteText msg and team#Won msg');
			resetVoteStatus(gameObject);
			f.deleteDiscMessage(messageReaction.message, 3000, 'voteMessage');
			f.deleteDiscMessage(gameObject.getTeamWonMessage(), 3000, 'teamWonMessage');
		}
	}
}

/**
 * Used when cancelling current vote
 */
const resetVoteStatus = (gameObject) => {
	// gameObject.setTeamWonMessage(message);
	gameObject.setTeamWon(undefined);
}

// Count amount of people who reacted that are part of this team
function countAmountUsersPlaying(team, peopleWhoReacted: ReactionUserManager){ 
	let counter = 0;
	//console.log('DEBUG: @countAmountUsersPlaying', team, peopleWhoReacted);
	peopleWhoReacted.cache.forEach(function(user){
		for (let i = 0; i < team.length; i++){
			if (user.id === team[i].uid){ // If person who reacted is in the game
				counter++;
			}
		}
	});
	return counter;
}

// Build String of trivia help commands
function buildTriviaHelpCommands(){
	let s = '*Available modes for trivia:* \n';
	s += prefix + 'trivia [category] [difficulty]\n';
	s += 'Arguments are optional\n';
	s += '**Difficulties:** *easy*, *medium*, *hard*, *all*\n';
	s += '**Categories:**\n';
	s += '*9*: General Knowledge\n';
	s += '*10*: Entertainment: Books\n';
	s += '*11*: Entertainment: Film\n';
	s += '*12*: Entertainment: Music\n';
	s += '*13*: Entertainment: Musicals & Theatres\n';
	s += '*14*: Entertainment: Television\n';
	s += '*15*: Entertainment: Video Games\n';
	s += '*16*: Entertainment: Board Games\n';
	s += '*17*: Science & Nature\n';
	s += '*18*: Science: Computers\n';
	s += '*19*: Science: Mathematics\n';
	s += '*20*: Mythology\n';
	s += '*21*: Sports\n';
	s += '*22*: Geography\n';
	s += '*23*: History\n';
	s += '*24*: Politics\n';
	s += '*25*: Art\n';
	s += '*26*: Celebrities\n';
	s += '*27*: Animals\n';
	s += '*28*: Vehicles\n';
	s += '*29*: Entertainment: Comics\n';
	s += '*30*: Science: Gadgets\n';
	s += '*31*: Entertainment: Japanese Anime & Manga\n';
	s += '*32*: Entertainment: Cartoons & Animations\n';
	return s;
}

// DEPRECATED: Used for all none moved commands until fully migrated
export const buildHelpString = (userID: string, messageNum: number): string => {
	if (messageNum === 0){
		// TODO: More simple help without detailed explanation, add this option to helpCommands line
		let s = '*Available commands for ' + bot_name + ':* \n';
		s += '**' + prefix + 'ping** Returns time of response to server\n';
		s += '**' + statsCommands.toString().replace(/,/g, ' | ') + '** Returns your own rating\n';
		s += '**' + prefix + 'roll [high] [low, high]** Rolls a number (0 - 100)\n';
		s += '**' + triviaCommands.toString().replace(/,/g, ' | ') + '** Starts a trivia game in the textchannel *' + getChannelName() + '*\n';
		s += '**' + triviaModesCommands.toString().replace(/,/g, ' | ') + '** Shows options for trivia mode\n';
		s += '**' + balanceCommands.toString().replace(/,/g, ' | ') + '** Starts an inhouse game with the players in the same voice chat as the message author.\n';
		s += '**' + team1wonCommands.toString().replace(/,/g, ' | ') + ' | ' + team2wonCommands.toString().replace(/,/g, ' | ') 
			+ '** Starts report of match result, requires majority of players to upvote from game for stats to be recorded.\n';
		s += '**' + tieCommands.toString().replace(/,/g, ' | ') + '** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n';
		s += '**' + cancelCommands.toString().replace(/,/g, ' | ') + '** Cancels the game, to be used when game was decided to not be played\n';
		s += '**' + uniteAllCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite all users active in voice to same channel\n';
		s += '**' + mapvetostartCommands.toString().replace(/,/g, ' | ') + '** Starts a map veto (*cs only*)\n';
		if (getAdminUids().includes(userID)){
			s += '**' + exitCommands.toString().replace(/,/g, ' | ') + '** *Admin Command* Clear all messages, exit games, prepares for restart\n';
		}
		return s;	
	}
	if (messageNum === 1){
		let s = '*Available commands for ' + bot_name + ' (All Options):* \n';
		s += '(**[opt = default]** Syntax for optional arguments)\n\n';
		s += '**' + prefix + 'ping** Returns time of response to server\n\n'; // 
		s += '**' + statsCommands.toString().replace(/,/g, ' | ') + ' [game = cs]** Returns your own rating\n'
			+ '**[game]** Opt. argument: name of the mode to retrieve stats for. Available modes are [' + getAllModes() + ']\n\n';
		s += '**' + prefix + 'roll [high] [low, high]** Rolls a number (0 - 100)\n' 
		// TODO: More logical way of writing the parameters, since high change place depending on #args. Change in simple above as well
			+ '**[high]** (0 - high) \t\t**[low, high]** (low - high)\n\n';
		s += '**' + triviaCommands.toString().replace(/,/g, ' | ') + ' [questions = allsubjectseasy]** Starts a trivia game in the textchannel *' + getChannelName() + '*\n'
			+ '**[questions]** Opt. argument: name of question field and difficulty.\n\n';
		s += '**' + triviaModesCommands.toString().replace(/,/g, ' | ') + '** Shows options for trivia mode\n';
		if (getAdminUids().includes(userID)){
			s += '**' + exitCommands.toString().replace(/,/g, ' | ') + '** *Admin Command* Clear all messages, exit games, prepares for restart\n\n';
		}
		return s;	
	} else if (messageNum === 2){
		let s = '**Start Game commands**\n\n';
		s += '**' + balanceCommands.toString().replace(/,/g, ' | ') + ' [game = cs]** Starts an inhouse game with the players in the same voice chat as the message author. '
			+ 'Requires 2, 4, 6, 8 or 10 players in voice chat to work.\n'
			+ '**[game]** Opt. argument: name of the game being played. Available games are [' + getGameModes() + ']\n\n';
		s += '**' + team1wonCommands.toString().replace(/,/g, ' | ') + ' | ' + team2wonCommands.toString().replace(/,/g, ' | ') 
			+ '** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. '
			+ 'If majority of players downvote, this match result report disappears, use **' + prefix + 'cancel** for canceling the match after this\n\n';
		s += '**' + tieCommands.toString().replace(/,/g, ' | ') + '** If a match end in a tie, use this as match result. Same rules for reporting as **' + prefix + 'team1Won | ' + prefix + 'team2Won**\n\n';
		s += '**' + cancelCommands.toString().replace(/,/g, ' | ') + '** Cancels the game, to be used when game was decided to not be played\n'
			+ 'Game can only be canceled by the person who started the game\n\n';
		s += '**' + uniteAllCommands.toString().replace(/,/g, ' | ') + ' [channel]** Unite all users active in voice to same channel\n'
			+ '**[channel]** Opt. argument: name of channel to unite in\n\n';
		s += '**' + mapvetostartCommands.toString().replace(/,/g, ' | ') + '** Starts a map veto (*cs only*)\n\n';
			/*
			+ '**[player]** Required if more than 2 players in voiceChannel. Person who is challenged\n'
			+ '**[game]** Opt. argument: name of the game being played. Available games are [' + player_js.getGameModes1v1() + ']\n\n';*/
		return s;	
	}
	return '';
}

// Here follows callbackFunctions for handling bot sent messages


async function callbackVoteText(message){
	currentTeamWonGameObject.setVoteMessage(message);
	await message.react(emoji_agree);
	message.react(emoji_disagree);
}

const noop = (message) => { // callback used when no operation is wanted
	// Doesn't delete the message
}

export const printMessage = (message, channelMessage, callback = noop) => { // Default: NOT removing message
	f.print(channelMessage, message, callback);
}