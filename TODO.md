# TODO:
#### Need to check all functionality, since so much is changed

## Features:

### Reduce amount of necessary fields

## Unite all exploit dodge
    
    Before uniting all players, should save their current voiceChannel
        Then, possible to unUniteAll to revert exploit 
    Should everyone be allowed to uniteall?

## Support starting multiple games at the same time

### Create Game object when starting game holding activeMembers, gameid etc
### Potentially save this to file to solve following
    "activeGames.txt"
    Support restarting bot and realizing game is going
        Potentially -pickupGame [disc message ID] or something
        Requires to pickupGame on startup of bot
    Iterate through file and recreate game object from this
        Remove messages, delete all on startup aswell, so bot doesn't clog unnecessarily
        Update all uses of activeMembers
        Store gameid on players when starting game
        For every command currently requiring stage 1, check gameID => check if player is inGame => effect for that game. Else nothing ("not in a game")
        Should remove phase 0 and 1 from code
            Don't allow to start a game when you already are in a game
### Add log for all data, all prints should also write to logfile so dumps are saved to be analyzed
    Currently pipes >> OUTPUT.log 2>ERROR.log
## Trivia
    NaN results fixed? Might still exist on -exit command + user that didn't start the trivia
    If spam bot, it can print new questions result with last responses answer
        Check to make sure it prints the newest questions repsonse at all time
    Something about caps in ans
    Report Question button, saves question for analysis
        If question is uninteresting (which of the following, should be filtered) or buggy
        Update Text on start trivia with this feature when implemented
    Prevent starting 2 games at once
        Move so faster block to prevent more than one trivia trying to start
    Decrease point for all players (some rule to not increase if you have below a certain value through this) on hint reveals as well
        Only decrease the people with highest potential point earnings (Down to 3?)
    If noone answered anything 5 questions (attempted) in a row, end questions
    Make it known that prefix commands wont work in trivia channel
### Check to see if optional prefix can be used elsewhere (used in trivia)
        Move functional call to f, so only requires array of commands, f handles prefix check
### Split command check for empty available channels if Team1 & Team2 isn't available
### Refactor All commands from bot, make arguments read from same place
        Exchange read of optional commands to all be from bot.js (voiceMove have in variable for example )
            Every place that have startsWith instead of includes
            https://anidiotsguide_old.gitbooks.io/discord-js-bot-guide/content/examples/command-with-arguments.html
        Move files into folders, command folder
            https://anidiotsguide_old.gitbooks.io/discord-js-bot-guide/content/coding-guides/a-basic-command-handler.html
### Handle name lengths for prints in f.js so names are aligned in tabs after longest names
        Try embeds, otherwise below https://anidiotsguide_old.gitbooks.io/discord-js-bot-guide/content/examples/using-embeds-in-messages.html
        `` Code blocks could be used for same size on chars, but cant have bold text then (Used on player names?)
        Reference: TODO: Print``
### Support unite to channels with names over one word
        Easier with commands change, take all arguments after first as one, for this one
## Bigger but Core Features:
### Challenge / Duel: Challenge someone to 1v1
        Duel: Should be same as balance for 2 people in call
            Queue: Solo "Queue" so anyone can accept, creates game between user that accepts and person queuing
            Reference TODO: Queue
        Challenge:  specific person 
            if challenge is used: Should be able to challenge anyone in discord
            If challenged: message that user where user can react to response in dm. Update in channel that match is on
            Reference TODO: Challenge
### Save every field as a Collection{GuildSnowflake -> field variable} to make sure bot works on many servers at once
#### Put on hold until Game Object is made
        Change bot to be instances instead of file methods, reach everything from guildSnowflake then (same logic as player but for bot)
        Reference: TODO: guildSnowFlake
### Alternative map veto system (faster). Ban message and pick message, maps through emotes. Add all for picks, remove for ban. Highest sum after time => chosen
## Refactor:
### Come up with better system for choosing winner of games
### Store MMR for more games
        Change into new created tables, ratings etc to have gamesPlayed for all games instead of sharing (only relevant for cs)
        Stats: Show all stats where stats are available (gamesPlayed > 0)
        Reference: TODO: RefactorDB
### Fix async/await works
        Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
            Double check places returning promises, to see if they are .then correctly
### Reflect: Should aim map be affected in what you play? Assumed for 1v1, but what about 2v2?
## Tests:
### Add test method so system can test balance / matchmaking without updating db on every match (-balance test or something)
## Deluxe Features (Ideas):
### Remake db-sequelize with mysql lib instead of sequelize
### (Different System for Starting MMR)
        Start MMR chosen as either 2400, 2500 or 2600 depending on own skill, for better distribution in first games, better matchup
        OR
        Add a second hidden rating for each user, so even though they all start at same mmr, 
            this rating is used to even out the teams when unsure (Only between people of same rank)
### Additions for new channel support / less manual work (If automated it is easier to move bot to a different channel)
        Check if channels are available on startup, create trivia text channel, etc
        Custom emojis
            mapVeto emotes, custom upvote/downvote (seemsgood maybe)
        Voice channels for Team split (Team1, Team2)
        Text channel for trivia
### Benefits of running system through node process handler (something):
        Restart in 30 sec when connection terminated due to no internet connection, currently: Unhandled "error" event. Client.emit (events.js:186:19)
        Better handling of removing messages. require('node-cleanup'); code could be run better in f.js
        Cleanupandexit can then have process.exit();
### Alternative MapVeto:
        mapVeto using majority vote instead of captains
### GDPR laws
        Add feature for user to remove themself from databse (should not be used as a reset) = ban from system
## Big ideas:
### Add tournament mode, ladders, brackets etc
### Twitter deathmatch
### Add music functionality
### Family Feud
### Pick-em CS (Check on progames, choose stuff, hltv)