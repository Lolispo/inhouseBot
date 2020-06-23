'use strict';
// Author: Petter Andersson

/*
	Class handles active games being played
*/

var activeGames = [];

exports.getActiveGames = function(){
    return activeGames;
}

function Game(gameID, channelMessage) {
    this.gameID = gameID;   // Unique id for game, set as the balance message id in the discord channel
    this.channelMessage = channelMessage; // Controls which channel to make prints in
    this.activeMembers;     // Active members playing (team1 players + team2 players)
    this.balanceInfo;       // Object: {team1, team2, difference, avgT1, avgT2, avgDiff, game} Initialized on creation of game object
    this.serverId;          // ServerId

    this.matchupMessage = channelMessage;    // One who started game's balance's message (-b)
    this.matchupServerMsg; 	// Discord message for showing matchup, members in both teams and mmr difference
    this.voteMessage;		// When voting on who won, this holds the voteText discord message
    this.teamWonMessage;	// The typed teamWon message, used to vote on agreeing as well as remove on finished vote
    this.teamWon;			// Keeps track on which team won
    
    this.mapStatusMessage;  // Message that keep track of which maps are banned and whose turn is it
    this.mapMessages = [];  // Keeps track of the discord messages for the different maps 
    this.mapVetoTurn;       // Turn variable, whose turn it is
    this.captain1;			// Captain for team 1
    this.captain2;			// Captain for team 2
    this.bannedMaps = [];	// String array holding who banned which map, is used in mapStatusMessage

    activeGames.push(this);

    // Returns true if userid is contained in activeMembers in this game
    this.containsPlayer = function(uid){
        return this.activeMembers.some(function(guildMember){
            return guildMember.id === uid
        });
    }

    this.getBalanceInfo = () => this.balanceInfo;

    this.getMatchupMessage = () => this.matchupMessage;

    this.getTeamWonMessage = () => this.teamWonMessage;

    this.getTeamWon = (value) => this.teamWon;

    this.getMatchupServerMsg = () => this.matchupServerMsg;

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

exports.createGame = function(gameID, channelMessage){
	return new Game(gameID, channelMessage);
}

// Returns the game where the author is
exports.getGame = (author) => {
    return activeGames.find((game) => game.containsPlayer(author.id));
}

exports.hasActiveGames = () => activeGames.length !== 0;

// Finds the game with the mapMessage reacted to or null
exports.getGameMapMessages = (messageReaction) => {
    return activeGames.find((game) => {
        return game.getMapMessages().some((mapMsg) => messageReaction.message.id === mapMsg.id);
    });
}

// Deletes the gameobject, returns the list afterwards
exports.deleteGame = (gameObject) => {
    const index = activeGames.indexOf(gameObject);
    if (index > -1) {
        activeGames.splice(index, 1);
    } else {
        console.error('Failed to delete gameObject', gameObject);
    }
    return activeGames;
}