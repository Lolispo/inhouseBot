'use strict';
// Author: Petter Andersson

/*
	Class handles active games being played
*/

const f = require('../tools/f');
const { cancelGameCSServer } = require('../csserver/cs_console');

let activeGames = [];

const getActiveGames = () => activeGames;

function Game(gameID, channelMessage) {
    this.gameID = gameID;   // Unique id for game, set as the balance message id in the discord channel
    this.channelMessage = channelMessage; // Controls which channel to make prints in
    this.activeMembers;     // Active members playing (team1 players + team2 players)
    this.balanceInfo;       // Object: {team1, team2, difference, avgT1, avgT2, avgDiff, game} Initialized on creation of game object
    
    this.serverId;          // ServerId
    this.matchId;           // MatchId for server
    this.csConsoleIntervalPassive;   // between games - lower time
    this.csConsoleIntervalActive;    // active gameInterval

    this.matchupMessage = channelMessage;    // One who started game's balance's message (-b)
    this.matchupServerMsg; 	// Discord message for showing matchup, members in both teams and mmr difference
    this.voteMessage;		// When voting on who won, this holds the voteText discord message
    this.teamWonMessage;	// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
    this.teamWon;			// Keeps track on which team won
    this.freshMessage = channelMessage;      // Fresh message in same channel

    this.mapStatusMessage;  // Message that keep track of which maps are banned and whose turn is it
    this.mapMessages = [];  // Keeps track of the discord messages for the different maps 
    this.mapVetoTurn;       // Turn variable, whose turn it is
    this.captain1;			// Captain for team 1
    this.captain2;			// Captain for team 2
    this.bannedMaps = [];	// String array holding who banned which map, is used in mapStatusMessage

    activeGames.push(this);

    // Returns true if userid is contained in activeMembers in this game
    this.containsPlayer = (uid) => {
        return this.activeMembers.some((guildMember) => {
            return guildMember.id === uid
        });
    }

    this.getBalanceInfo = () => this.balanceInfo;

    this.getMatchupMessage = () => this.matchupMessage;

    this.getFreshMessage = () => this.freshMessage;
    this.updateFreshMessage = (message) => {
        if (message.channel.id === this.matchupMessage.channel.id) {
            this.freshMessage = message;
            // console.log('Updated Fresh');
        }
    }

    this.setIntervalPassive = (value) => this.csConsoleIntervalPassive = value;
    this.setIntervalActive = (value) => this.csConsoleIntervalActive = value;
    this.getIntervalPassive = () => this.csConsoleIntervalPassive;
    this.getIntervalActive = () => this.csConsoleIntervalActive;

    this.setMatchId = (value) => this.matchId = value;
    this.getMatchId = () => this.matchId;

    this.getTeamWonMessage = () => this.teamWonMessage;

    this.getTeamWon = (value) => this.teamWon;

    this.getMatchupServerMessage = () => this.matchupServerMsg;

    this.getActiveMembers = () => this.activeMembers;

    this.getChannelMessage= () => this.channelMessage;

    this.getVoteMessage = () => this.voteMessage;

    this.setVoteMessage = (value) => this.voteMessage = value;

    this.getGameID = () => this.gameID;

    this.getMapMessages = () => this.mapMessages;

    this.getMapVetoTurn = () => this.mapVetoTurn;

    this.setMapVetoTurn = (value) => this.mapVetoTurn = value;

    this.getCaptain1 = () => this.captain1;

    this.getCaptain2 = () => this.captain2;

    this.setCaptain1 = (value) => this.captain1 = value;

    this.setCaptain2 = (value) => this.captain2 = value;

    this.getBannedMaps = () => this.bannedMaps;
    
    this.getMapStatusMessage = () => this.mapStatusMessage;
    
    this.setMapStatusMessage = (variable) => this.mapStatusMessage = variable;

    this.setTeamWon = (value) => this.teamWon = value;

    this.setTeamWonMessage = (message) => this.teamWonMessage = message;

    this.setMatchupServerMessage = (message) => this.matchupServerMsg = message;
 
    this.setMapMessages = (result) => this.mapMessages = result;

    this.setActiveMembers = (members) => this.activeMembers = members;

    this.setBalanceInfo = (value) => this.balanceInfo = value;

    this.setMatchupMessage = (message) => this.matchupMessage = message;

    this.setServerId = (value) => this.serverId = value;

    this.getServerId = () => this.serverId;
}

const createGame = function(gameID, channelMessage){
	return new Game(gameID, channelMessage);
}

// Returns the game where the author is
const getGame = (author) => {
    return activeGames.find((game) => game.containsPlayer(author.id));
}

const hasActiveGames = () => activeGames.length !== 0;

// Finds the game with the mapMessage reacted to or null
const getGameMapMessages = (messageReaction) => {
    return activeGames.find((game) => {
        return game.getMapMessages().some((mapMsg) => messageReaction.message.id === mapMsg.id);
    });
}

// Deletes the gameobject, returns the list afterwards
const deleteGame = (gameObject) => {
    // console.log('DEBUG @deleteGame BEFORE', activeGames);
    const index = activeGames.indexOf(gameObject);
    if (index > -1) {
        activeGames.splice(index, 1);
    } else {
        console.error('Failed to delete gameObject', gameObject);
    }
    // console.log('DEBUG @deleteGame AFTER', activeGames);
    return activeGames;
}

const clearIntervals = (gameObject) => {
    if (gameObject) {
        // console.log('DEBUG @clearIntervals:', gameObject.getIntervalPassive(), gameObject.getIntervalActive());
        clearInterval(gameObject.getIntervalPassive());
        clearInterval(gameObject.getIntervalActive());
    } else {
        console.error('@clearIntervals ERROR gameObject not defined', gameObject);
    }
}

// Used to delete messages if game ended
// Takes GameObject to clean
const cleanOnGameEnd = (gameObject) => {
    console.log('@cleanOnGameEnd Init');
	const mapMessages = gameObject.getMapMessages();
	if(!f.isUndefined(mapMessages)){
		for(var i = mapMessages.length - 1; i >= 0; i--){
			f.deleteDiscMessage(mapMessages[i], 0, 'mapMessages['+i+']', function(msg){
				var index = mapMessages.indexOf(msg);
				if (index > -1) {
					mapMessages.splice(index, 1);
				}
			});	
		}
	}
	if(!f.isUndefined(gameObject.getMapStatusMessage())){
		f.deleteDiscMessage(gameObject.getMapStatusMessage(), 0, 'mapStatusMessage');	
	}
	if(!f.isUndefined(gameObject.getVoteMessage())){
		f.deleteDiscMessage(gameObject.getVoteMessage(), 0, 'voteMessage');
	}
	if(!f.isUndefined(gameObject.getTeamWonMessage())){
		f.deleteDiscMessage(gameObject.getTeamWonMessage(), 0, 'teamWonMessage');
	}
	if(!f.isUndefined(gameObject.getMatchupServerMessage())){
		//console.log('DEBUG getMatchupServerMessage cleanOnGameEnd', gameObject.getMatchupServerMessage().content);
		f.deleteDiscMessage(gameObject.getMatchupServerMessage(), 0, 'matchupServerMsg');
	}
	if(!f.isUndefined(gameObject.getMatchupMessage())){
		//console.log('DEBUG matchupMessage cleanOnGameEnd', gameObject.getMatchupMessage().content);
		f.deleteDiscMessage(gameObject.getMatchupMessage(), 0, 'matchupMessage');
	}
    const gameName = gameObject.getBalanceInfo().game;
    console.log('@cleanOnGameEnd GameName:', gameName);
	if (gameName === 'cs' || gameName === 'cs1v1') {
		cancelGameCSServer(gameObject);
	}
	// Clear csserver interval listeners
	clearIntervals(gameObject);
	// Remove game from ongoing games
	deleteGame(gameObject);
}


module.exports = {
    createGame : createGame,
    getGame : getGame,
    hasActiveGames : hasActiveGames,
    getGameMapMessages : getGameMapMessages,
    deleteGame : deleteGame,
    cleanOnGameEnd : cleanOnGameEnd,
    getActiveGames : getActiveGames,
    clearIntervals : clearIntervals,
}
