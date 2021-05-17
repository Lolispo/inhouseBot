# TODO:
## Tests

Add unit tests for all files

Add integration tests for main functionalities

# Error message

Hej undefined

Fix crash
/home/ubuntu/Projects/inhouseBot/src/steamid.js:49
  const steamid = users[0].dataValues.steamid;
                           ^

TypeError: Cannot read property 'dataValues' of undefined
    at sendSteamId (/home/ubuntu/Projects/inhouseBot/src/steamid.js:49:28)


Refactor commands to command folder

LastGame command to help list
    Check generate collection from the command files
        Add entry to public list from each command function which is used by the help command

UTF8 Encoding
    ALTER TABLE (table name) CONVERT TO CHARACTER SET UTF8

Set up scheduled backup of data to S3 https://stackoverflow.com/questions/39362083/export-mysql-dump-from-aws-rds-via-aws-command-line

Verify:
    CHECK: STEAM_1:1:6530834> Paraflaxet = DOESNT EXIST AUTHOR
    Petter not counted in discord - didn't work for split/unite etc
        Update: Check if this is fixed pointing to a player instead
        When done, remove player print when game done

Store stats for game results (same table as map?)

Add +mmr to leaderboard results?
    Low prio

rank overall (rank 1 highest mmr, 5 fifth highest)

Allow mmr for any game (if Admin)

STATS
Stats screen revamp size - decrease
    Remove 5k, 4k etc if no entries are found for any player
Include title of results and teams in table
    |----------|:-------------:|------:|
Highlight best performer
    Problematic since ``` codeblock allows for same character sizes (tables) but no bold
    Star mark things - Makes it hard in codeblock mode due to size of utf8 chars
        Find Char with normal size
        Should do this without ruining table size

Fix async await
https://discordjs.guide/additional-info/async-await.html#how-do-promises-work


Re-add dathost integraton
    Move server_info.js to env variables
    Add more documentation on where to fetch env variables

Investigate unable to hear each other when split / uniting channels
    editGuildMember seems to have a limit of 10 - investigate if side effect of this limit is that you are connected to the channel 
     in a weird way. Further investigation needed

FIX BUG: New players added foreign key constraint
    Fixed?

(node:6580) DeprecationWarning: Collection#find: pass a function instead

-server also gives link to press connect

getResult - Prevent being able to use during a game (fucks the game up)
    If game is not done (game unfinished) dont run endgame commands etc


Support not playing on the csgo server option for cs games

Not able to send DM error handling:
    @configureServer.filePath: cfg/kosatupp_inhouse_coordinator_match-gen.cfg
(node:15012) UnhandledPromiseRejectionWarning: DiscordAPIError: Cannot send messages to this user
    at item.request.gen.end (C:\Users\Petter\Documents\GitHub\inhouseBot\node_modules\discord.js\src\client\rest\RequestHandlers\Sequential.js:85:15)
    at then (C:\Users\Petter\Documents\GitHub\inhouseBot\node_modules\snekfetch\src\index.js:215:21)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
(node:15012) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)
(node:15012) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.


Fix double mmr 
    DB_sequelize rollback functionality

## Prio

Merge "improve-stats" branch

Rollback fix

Look into: Serverless MySQL on AWS instead of hosted (cost reduction?)

Season reset script (Half amount of database score)
    BONUS: Fetch Summary of season to summarize for users

Fix default mmr for trivia
CATKNIFE:     2500 rating
Groovy:     2500 rating
Knas:     2500 rating
PARaflaXet:     2500 rating

Save highest lowest mmr per play (edit rating table)

Player 0 -> 10 remove stats
    Command removed
    cs Leaderboard requires games > 0

Fetch Winner (check console when game ends to see who won)
    Syntax of message
    Trigger Unite
    Trigger fetch CFG File
    (Trigger score change? -> Should be done after score file)

randoma om namn om över ett visst antal chars: Morgans Stealth Assasins e för långt

P4G name only when 5

Design of team names change (Change color if possible)

Stäng av read console tills testad

emailSign.belongsTo(models.user_number, {
     foreignKey: 'user_number_id',
     onDelete: 'CASCADE'
});

Winston logger

## CS Integration

Stream
    newMessages aren't entered - debug

-gen file to .gitignore

"
hm, har en idé för att minska lite på mängden api spam. Man lär ju egentligen bara vilja skicka meddelanden till discord mellan matcher. Typ för att starta en ny. Det finns ett kommando som heter get5_status som kan berätta om en match är loaded eller inte. Man skulle kunna skicka det typ varje minut och om ingen match är loaded och det är >3 spelare på servern så börjar den polla för att se om nån skriver i chatten. Kasnke till och med skickar en "say" när den börjar lyssna
bonus är att man kan använda det så att den vet när den ska kolla databasen för att se matchresultatet
den kommer fortfarande att tugga väldigt mycket lines när den väl är aktiv, men då sitter den iaf inte konstant och läser en massa useless shit
"

MySQL - (Anton access) - initialized
    check format and initialize connection - Not saving any data


"You can also set get5_mysql_force_matchid to 1 to make get5 ignore the matchid in match configs, and instead set it based on the id assigned when the plugin inserts into get5_stats_matches" so if u want matchid 100 get5_mysql_force_matchid should be set to 0 and matchid should be set to 100.
tror våran är satt till 1

Make sure to not allow updating server if discord game is ongoing on cs

### eslint add

### Mapveto

    Dathost: Add change map level as option ingame config

    give option to choose if more than default 8 (abbey, subzero, anubis)

    Test - sometimes captain not able to vote?

    Add all cs maps emojis to git repo

    Fix: Unhandled promise rejection if message is removed when you try to add reaction (fast interaction with mapveto)

Fix datarace when multiple people upvote - lock

Bug: revisit prints on emote adds (seems not to work fully on removing (does it remove upvote if you press downvote?))

Bug: Cant start new game because already in a game
    Team won should cancel game

Store only message id instead of entire messages
    ?

## Features:

### Cancel game after 24 h duration, to not have active games clog up for users

### Rollback latest games functionality

### Unite all exploit dodge

### Match history

# More
    
    Before uniting all players, should save their current voiceChannel
        Then, possible to unUniteAll to revert exploit 
    Should everyone be allowed to uniteall?

### Add log for all data, all prints should also write to logfile so dumps are saved to be analyzed

### birthday:
    
    Feature: Set own birthday

    Every year addition

    Feature: See next persons birthday

## Trivia
    Rewrite print trivia game modes to use Map of trivia game modes

    Allow choosing trivia game mode through name aswell

    Allow any order between subject and difficulty

    Check Bug:
        If you answer question -> between questions => 2 questions, since ans var is still active
            Check
        NaN results fixed? Might still exist on -exit command + user that didn't start the trivia
        If spam bot, it can print new questions result with last responses answer
            Check to make sure it prints the newest questions repsonse at all time
        Something about caps in ans
        Prevent starting 2 games at once
            Move so faster block to prevent more than one trivia trying to start
    Report Question button, saves question for analysis
        If question is uninteresting (which of the following, should be filtered) or buggy
        Update Text on start trivia with this feature when implemented
    If noone answered anything 5 questions (attempted) in a row, end questions
### Pickup games from crash from file
    "activeGames.txt"
    Support restarting bot and realizing game is going
        Potentially -pickupGame [disc message ID] or something
        Requires to pickupGame on startup of bot
    Iterate through file and recreate game object from this
        Remove messages, delete all on startup aswell, so bot doesn't clog unnecessarily
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
### Csgostats integration
        Allow users to provide match id and upload that request to csgostats and then return URL to csgostats
### Challenge / Duel: Challenge someone to 1v1
        Duel: Should be same as balance for 2 people in call
            Queue: Solo "Queue" so anyone can accept, creates game between user that accepts and person queuing
            Reference TODO: Queue
        Challenge:  specific person 
            if challenge is used: Should be able to challenge anyone in discord
            If challenged: message that user where user can react to response in dm. Update in channel that match is on
            Reference TODO: Challenge
        
### Save every field as a Collection{GuildSnowflake -> field variable} to make sure bot works on many servers at once
    Normal game should work on many channels at once, trivia will not atm. Game object trivia?
    Change bot to be instances instead of file methods, reach everything from guildSnowflake then (same logic as player but for bot)
        Reference: TODO: guildSnowFlake
### Alternative map veto system (faster). Ban message and pick message, maps through emotes. Add all for picks, remove for ban. Highest sum after time => chosen
## Refactor:
### Come up with better system for choosing winner of games
    Allow super upvote - admin upvote instant results
### Fix async/await works
        Recheck every instace returning promises to use async/await instead https://javascript.info/async-await
            Double check places returning promises, to see if they are .then correctly
### Reflect: Should aim map be affected in what you play? Assumed for 1v1, but what about 2v2?
## Tests:
### Add test method so system can test balance / matchmaking without updating db on every match (-balance test or something)
### connect as steam/connect link (pressable)
### Link dota instruction connect 
## Deluxe Features (Ideas):
### Remake db_sequelize with mysql lib instead of sequelize
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
### Twitter deathmatch - notification on pro cs dm sessions
### Add music functionality - should be a lot available to look at
### Family Feud - alternative trivia
### Pick-em CS (Check on progames, choose stuff, hltv) (low prio)
### Integration with ebot server

