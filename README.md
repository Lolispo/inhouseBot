# inhouseBot - Make your own inhouse league!

[![Issues Here](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/worlund/inhouseBot/issues/new)
[![Installation Here](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/worlund/inhouseBot/wiki/Installation)

#### A discord bot made in NodeJS that handles a inhouse system with rating for each individual user. 

#### Supports sizes of 2v2, 3v3, 4v4 and 5v5

## Available commands

Prefix and bot-name can be modified to own liking

*Available commands for inhouse-bot (All Options):*  
(**[opt = default]** Syntax for optional arguments)

**-ping** *Pong*

**-h | -help** Shows the available commands

**-ha | -helpall** Shows information about all commands in detail

**-leaderboard [game = cs]** Returns Top 5 MMR holders  
**[game]** Opt. argument: name of the mode to retrieve top leaderboard for. Available modes are [cs,dota,cs1v1,dota1v1,trivia]

**-stats [game = cs]** Returns your own rating  
**[game]** Opt. argument: name of the mode to retrieve stats for. Available modes are [cs,dota,cs1v1,dota1v1,trivia]

**-roll [high] [low, high]** Rolls a number (0 - 100)  
**[high]** (0 - high)           **[low, high]** (low - high)

**-trivia | -starttrivia | -triviastart [questions = allsubjectseasy]** Starts a trivia game in the textchannel *trivia-channel*  
**[questions]** Opt. argument: name of question field and difficulty.

**-exit** *Admin Command* Clear all messages, exit games, prepares for restart


**Start Game commands**

**-b | -balance | -balanceGame | -inhousebalance [game = cs]** Starts an inhouse game with the players in the same voice chat as the message author.   
Requires 4, 6, 8 or 10 players in voice chat to work.  
**[game]** Opt. argument: name of the game being played. Available games are [cs,dota]

**-team1won | -team2won** Starts report of match result, requires majority of players to upvote from game for stats to be recorded.   
If majority of players downvote, this match result report disappears, use **-cancel** for canceling the match after this

**-tie | -draw** If a match end in a tie, use this as match result. Same rules for reporting as **-team1Won | -team2Won**

**-c | -cancel | -gamenotplayed** Cancels the game, to be used when game was decided to not be played  
Game can only be canceled by the person who started the game

**-split** Splits voice chat into two separate voice chats

**-u | -unite [channel]** Unite voice chat after game  
**[channel]** Opt. argument: name of channel to unite in

**-ua | -uniteAll [channel]** Unite all users active in voice to same channel  
**[channel]** Opt. argument: name of channel to unite in

**-mapveto | -startmapveto | -mapvetostart | -startmaps** Starts a map veto (*cs only*)

**-duel | -challenge [player] [game = cs] ** Starts a duel, a 1v1 match between 2 people **TBA**  
If only two people are in voiceChannel, start duel between them. Otherwise [player] is required.  
**[player]** Required if more than 2 players in voiceChannel. Person who is challenged  
**[game]** Opt. argument: name of the game being played. Available games are [cs1v1,dota1v1]

## Do you have any ideas for the future?

Make a pull request for a new issue in the repository.

Current TODO:s for the projects are listed in the files, main TODO section is in bot.js



