
// Author: Petter Andersson

/*
	Class handles active games being played
*/

import * as f from '../tools/f';
import { cancelGameCSServer } from '../csserver/cs_console';
import { GuildMember, Message } from 'discord.js';

interface IOptionalParameters extends Omit<Partial<Game>, 'gameID' | 'channelMessage'> {
  // Type used for constructor
}
export class Game {
  static activeGames = [];
  static getActiveGames = () => Game.activeGames;
  static getActiveGamesToString = (): string => {
    return `ActiveGames(${Game.activeGames.length}):\n${JSON.stringify(Game.activeGames, null, 2)}`;
  }
  static activeGamesFilePath = 'activeGame.json';
  static savedGamesStoragePath = 'activeGameStorage.json';

  gameID: string;
  channelMessage: Message;
  activeMembers: GuildMember[];
  balanceInfo;
  serverId: string;
  matchId: string;
  csConsoleIntervalPassive;
  csConsoleIntervalActive;
  matchupMessage: Message;
  matchupServerMsg: Message;
  voteMessage: Message;
  teamWonMessage: Message;
  teamWon;			// Keeps track on which team won
  freshMessage: Message; // Fresh message in same channel
  
  mapStatusMessage: Message; // Message that keep track of which maps are banned and whose turn is it
  mapMessages: Message[] = []; // Keeps track of the discord messages for the different maps
  mapVetoTurn; // Turn variable, whose turn it is
  captain1;			// Captain for team 1
  captain2;			// Captain for team 2
  bannedMaps;

  constructor(
    gameID: string, 
    channelMessage: Message,
    options?: IOptionalParameters
  ) {
    this.gameID = gameID; // Unique id for game, set as the balance message id in the discord channel
    this.channelMessage = channelMessage; // Controls which channel to make prints in

    // TODO: Fix so it takes the IDs etc and loads the correct information again
    // This doesn't correctly load functions etc which breaks the cleaning flow
    this.activeMembers = options?.activeMembers || []; // Active members playing (team1 players + team2 players)
    this.balanceInfo = options?.balanceInfo; // Object: {team1, team2, difference, avgT1, avgT2, avgDiff, game} Initialized on creation of game object
  
    this.serverId = options?.serverId; // ServerId
    this.matchId = options?.matchId; // MatchId for server
    this.csConsoleIntervalPassive = options?.csConsoleIntervalPassive; // between games - lower time
    this.csConsoleIntervalActive = options?.csConsoleIntervalActive; // active gameInterval
  
    this.matchupMessage = options?.matchupMessage || channelMessage; // One who started game's balance's message (-b)
    this.matchupServerMsg = options?.matchupServerMsg; 	// Discord message for showing matchup, members in both teams and mmr difference
    this.voteMessage = options?.voteMessage;		// When voting on who won, this holds the voteText discord message
    this.teamWonMessage = options?.teamWonMessage;	// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
    this.teamWon = options?.teamWon;			// Keeps track on which team won
    this.freshMessage = options?.freshMessage || channelMessage; // Fresh message in same channel
  
    this.mapStatusMessage = options?.mapStatusMessage; // Message that keep track of which maps are banned and whose turn is it
    this.mapMessages = options?.mapMessages || []; // Keeps track of the discord messages for the different maps
    this.mapVetoTurn = options?.mapVetoTurn; // Turn variable, whose turn it is
    this.captain1 = options?.captain1;			// Captain for team 1
    this.captain2 = options?.captain2;			// Captain for team 2
    this.bannedMaps = options?.bannedMaps || [];	// String array holding who banned which map, is used in mapStatusMessage

    console.log('Game created!', this);
    Game.activeGames.push(this);
  }

  // Returns true if userid is contained in activeMembers in this game
  containsPlayer = uid => {
    // console.log('@containsPlayer:', uid, this.activeMembers); // .map(mem => mem.id)
    return this.activeMembers.some(guildMember => guildMember.id === uid); //  || guildMember.userID === uid
  };

  getBalanceInfo = () => this.balanceInfo;

  getMatchupMessage = () => this.matchupMessage;

  getFreshMessage = () => this.freshMessage;
  updateFreshMessage = (message) => {
    if (message.channel.id === this.matchupMessage.channel.id) {
      this.freshMessage = message;
      // console.log('Updated Fresh');
    }
  };

  setIntervalPassive = value => this.csConsoleIntervalPassive = value;
  setIntervalActive = value => this.csConsoleIntervalActive = value;
  getIntervalPassive = () => this.csConsoleIntervalPassive;
  getIntervalActive = () => this.csConsoleIntervalActive;

  setMatchId = value => this.matchId = value;
  getMatchId = () => this.matchId;

  getTeamWonMessage = () => this.teamWonMessage;

  getTeamWon = () => this.teamWon;

  getMatchupServerMessage = () => this.matchupServerMsg;
  getActiveMembers = (): GuildMember[] => this.activeMembers;

  getChannelMessage = () => this.channelMessage;

  getVoteMessage = () => this.voteMessage;

  setVoteMessage = value => this.voteMessage = value;

  getGameID = () => this.gameID;

  getMapMessages = () => this.mapMessages;

  getMapVetoTurn = () => this.mapVetoTurn;

  setMapVetoTurn = value => this.mapVetoTurn = value;

  getCaptain1 = () => this.captain1;

  getCaptain2 = () => this.captain2;

  setCaptain1 = value => this.captain1 = value;

  setCaptain2 = value => this.captain2 = value;

  getBannedMaps = () => this.bannedMaps;

  getMapStatusMessage = () => this.mapStatusMessage;

  setMapStatusMessage = variable => this.mapStatusMessage = variable;

  setTeamWon = value => this.teamWon = value;

  setTeamWonMessage = message => this.teamWonMessage = message;

  setMatchupServerMessage = message => this.matchupServerMsg = message;

  setMapMessages = result => this.mapMessages = result;

  setActiveMembers = members => this.activeMembers = members;

  setBalanceInfo = value => this.balanceInfo = value;

  setMatchupMessage = message => this.matchupMessage = message;

  setServerId = value => this.serverId = value;

  getServerId = () => this.serverId;
}

export const createGame = (gameID, channelMessage): Game => {
  const game = new Game(gameID, channelMessage);
  return game;
};

export const loadFromFile = async (): Promise<Game> => {
  try {
    const data = await f.readFromFile(Game.activeGamesFilePath, 'Successfully loaded game:');
    try {
      const parsedData = JSON.parse(data);
      console.log('@LOADED', data, parsedData);
      return new Game(parsedData.gameID, parsedData.channelMessage, parsedData);
    } catch (e) {
      console.error('Unable to parse JSON from data:', data);
    }
    return undefined;
  } catch (e) {
    console.error('@Failed to load game');
  }
}

export const moveSavedGameToFile = async (gameObject) => {
  const data = await f.readFromFile(Game.savedGamesStoragePath);
  let preparedDataFormat;
  if (data) { // Data loaded
    const parsedData = JSON.parse(data);
    console.log('@MoveSavedGameToFile:', parsedData);
    preparedDataFormat = {
      listOfGames: [gameObject].concat(parsedData?.listOfGames)
    }
  } else {
    // No data loaded
    preparedDataFormat = {
      listOfGames: [gameObject]
    };
  }
  await f.writeToFile(Game.savedGamesStoragePath, preparedDataFormat);
}

export const saveGame = (gameObject: Game) => {
  try {
    moveSavedGameToFile(gameObject); // Allows overwriting activeGame
    f.writeToFile(Game.activeGamesFilePath, JSON.stringify(gameObject, null, 2), 'Successfully saved game to file: ' + Game.activeGamesFilePath);
  } catch (e) {
    console.error('@SaveGame Issue saving game:', e);
  }
}

// Returns the game where the author is
export const getGame = author => Game.activeGames.find(game => {
  return game.containsPlayer(author.id);
});

export const getGameByGameId = gameId => {
  return Game.activeGames.find(game => {
    return game.gameID === gameId;
  });
}

export const hasActiveGames = () => Game.activeGames.length !== 0;

// Finds the game with the mapMessage reacted to or null
export const getGameMapMessages = messageReaction => Game.activeGames.find(game => game.getMapMessages().some(mapMsg => messageReaction.message.id === mapMsg.id));

// Deletes the gameobject, returns the list afterwards
export const deleteGame = (gameObject) => {
  // console.log('DEBUG @deleteGame BEFORE', activeGames);
  const index = Game.activeGames.indexOf(gameObject);
  if (index > -1) {
    Game.activeGames.splice(index, 1);
  } else {
    console.error('Failed to delete gameObject', gameObject);
  }
  // console.log('DEBUG @deleteGame AFTER', activeGames);
  return Game.activeGames;
};

export const clearIntervals = (gameObject) => {
  if (gameObject) {
    // console.log('DEBUG @clearIntervals:', gameObject.getIntervalPassive(), gameObject.getIntervalActive());
    clearInterval(gameObject.getIntervalPassive());
    clearInterval(gameObject.getIntervalActive());
  } else {
    console.error('@clearIntervals ERROR gameObject not defined', gameObject);
  }
};

// Used to delete messages if game ended
// Takes GameObject to clean
export const cleanOnGameEnd = (gameObject) => {
  console.log('@cleanOnGameEnd Init');
  try {
    const mapMessages = gameObject.getMapMessages();
    if (!f.isUndefined(mapMessages)) {
      for (let i = mapMessages.length - 1; i >= 0; i--) {
        f.deleteDiscMessage(mapMessages[i], 0, `mapMessages[${i}]`, (msg) => {
          const index = mapMessages.indexOf(msg);
          if (index > -1) {
            mapMessages.splice(index, 1);
          }
        });
      }
    }
    if (!f.isUndefined(gameObject.getMapStatusMessage())) {
      f.deleteDiscMessage(gameObject.getMapStatusMessage(), 0, 'mapStatusMessage');
    }
    if (!f.isUndefined(gameObject.getVoteMessage())) {
      f.deleteDiscMessage(gameObject.getVoteMessage(), 0, 'voteMessage');
    }
    if (!f.isUndefined(gameObject.getTeamWonMessage())) {
      f.deleteDiscMessage(gameObject.getTeamWonMessage(), 0, 'teamWonMessage');
    }
    if (!f.isUndefined(gameObject.getMatchupServerMessage())) {
      // console.log('DEBUG getMatchupServerMessage cleanOnGameEnd', gameObject.getMatchupServerMessage().content);
      f.deleteDiscMessage(gameObject.getMatchupServerMessage(), 0, 'matchupServerMsg');
    }
    if (!f.isUndefined(gameObject.getMatchupMessage())) {
      // console.log('DEBUG matchupMessage cleanOnGameEnd', gameObject.getMatchupMessage().content);
      f.deleteDiscMessage(gameObject.getMatchupMessage(), 0, 'matchupMessage');
    }
    const game = gameObject.getBalanceInfo();
    if (game) {
      // If game is available
      const gameName = game.game;
      console.log('@cleanOnGameEnd GameName:', gameName);
      if (gameIsCS(gameName)) {
        cancelGameCSServer(gameObject);
      }
      // Clear csserver interval listeners
      clearIntervals(gameObject);
    }
  } catch (e) {
    console.error('@cleanOnGameEnd Error cancelling game:', e);
    throw e;
  }
  // Remove game from ongoing games
  deleteGame(gameObject);
};

export const gameIsCS = gameName => gameName === 'cs' || gameName === 'cs1v1';
export const gameIsCSMain = gameName => gameName === 'cs';
export const gameIsDota = gameName => gameName === 'dota' || gameName === 'dota1v1';
