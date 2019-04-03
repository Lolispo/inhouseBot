'use strict';
// Author: Petter Andersson

/*
	Class handles active games being played
*/

var activeGames = [];

exports.getActiveGames = function(){
    return activeGames;
}

function Game(gameID, channelMessage){
    this.gameID = gameID;   // Unique id for game, set as the balance message id in the discord channel
    this.channelMessage = channelMessage; // Controls which channel to make prints in
    this.activeMembers;     // Active members playing (team1 players + team2 players)
    this.balanceInfo;       // Object: {team1, team2, difference, avgT1, avgT2, avgDiff, game} Initialized on creation of game object

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

    this.getBalanceInfo = function(){
        return this.balanceInfo;
    }

    this.getMatchupMessage = function(){
        return this.matchupMessage;
    }

    this.getTeamWonMessage = function(){
        return this.teamWonMessage;
    }

    this.getMatchupServerMsg = function(){
        return this.matchupServerMsg;
    }

    this.getActiveMembers = function(){
        return this.activeMembers;
    }

    this.getChannelMessage= function(){
        return this.channelMessage;
    }

    this.getVoteMessage = function(){
        return this.voteMessage;
    }

    this.getGameID = function(){
        return this.gameID;
    }

    this.getMapMessages = function(){
        return this.mapMessages;
    }

    this.getMapVetoTurn = function(){
        return this.mapVetoTurn;
    }

    this.setMapVetoTurn = function(value){
        this.mapVetoTurn = value;
    }

    this.getCaptain1 = function(){
        return this.captain1;
    }

    this.getCaptain2 = function(){
        return this.captain2;
    }

    this.setCaptain1 = function(value){
        this.captain1 = value;
    }

    this.setCaptain2 = function(value){
        this.captain2 = value;
    }

    this.getBannedMaps = function(){
        return this.bannedMaps;
    }
    
    this.getMapStatusMessage = function(){
        return this.mapStatusMessage;
    }
    
    this.setMapStatusMessage = function(variable){
        this.mapStatusMessage = variable;
    }

    this.setTeamWon = function(value){
        this.teamWon = value;
    }

    this.setTeamWonMessage = function(message){
        this.teamWonMessage = message;
    }

    this.setMatchupServerMessage = function(message){
        this.matchupServerMsg = message;
    }
 
    this.setMapMessages = function(result){
        this.mapMessages = result;
    }

    this.setActiveMembers = function(members){
        this.activeMembers = members;
    }

    this.setBalanceInfo = function(value){
        this.balanceInfo = value;
    }

    this.setMatchupMessage = function(message){
        this.matchupMessage = message;
    }
}

exports.createGame = function(gameID, channelMessage){
	return new Game(gameID, channelMessage);
}

// Returns the game where the author is
exports.getGame = function(author){
    return activeGames.find(function(game){
        console.log('@getGame', game, author.id, game.containsPlayer(author.id));
        return game.containsPlayer(author.id);
    });
}

exports.hasActiveGames = function(){
    if(activeGames.length === 0){
        return false;
    }
    return true;
}

exports.getGameMapMessages = function(messageReaction){
    return activeGames.find(function(game){
        return game.getMapMessages().some(function(mapMsg){
            return messageReaction.message.id === mapMsg.id
        });
    });
}

exports.deleteGame = function(gameObject){
    activeGames.splice(gameObject, 1)
}