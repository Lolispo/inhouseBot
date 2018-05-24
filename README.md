# inhouseBot
A discord bot made in NodeJS that handles a inhouse system with rating for each individual user. 

## Available commands

Prefix and bot-name can be modified to own liking

*Available commands for inhouse-bot:* 

**-ping** *Pong*

**-b | balance | inhouseBalance** Starts an inhouse game with the players in the same voice chat as the message author. Requires 4, 6, 8 or 10 players in voice chat to work

**-team1Won | -team2Won** Starts report of match result, requires majority of players to upvote from game for stats to be recorded. If majority of players downvote, this match result report dissapears, use **-cancel** for canceling the match after this

**-draw | tie** If a match end in a tie, use this as match result. Same rules for reporting as **-team1Won | -team2Won**

**-c | cancel** Cancels the game, to be used when game was decided to not be played

**-h | help** Gives the available commands

**-leaderboard** Returns Top 5 MMR holders

**-stats** Returns your own rating

**-split** Splits voice chat

**-u | unite** Unite voice chat after game

**-mapVeto** Start map veto

**-h | help** Shows available commands

## Balance

### Supports sizes of 2v2, 3v3, 4v4 and 5v5

Make your own inhouse league!
