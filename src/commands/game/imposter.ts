import { GuildMember, Message, MessageReaction, User } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { print } from "../../tools/f";

const commands = ['imposter', 'impostor', 'impostergame', 'impostorgame'];

/**
 * Vote as before
 * Each imposter can TURN someone once (not another imposter)
 *  50% (number) that it is successful
 * The imposter doing the TURN action doesn't know if it is successful
 * 
 * Turn action can only be done once per game
 * 
 * After every round : Update message to all players if they have turned during the round
 * 
 * Twist gameplay: If you try to turn someone (still 50% chance) but they were already turned, they are turned back
 *  If you are turned then you get information
 *  This is an alternative gamemode to make it harder for games with multiple imposters
 *  
 * How to win: Att bara ha personer i sitt team kvar (no majority win)
 *  så 2 imposter och 1 town => imposters måste rösta town för att vinna
 * Med att rösta ut: Om man lägger en röst på en annan imposter och den åker ut => imposter lose
 * All imposters out => town wins
 * 
 * 1 vote per person.
 * 
 * 
 * Imposter game Message:
 * Round 1: You are imposter
 * Round 2: You are now not IMPOSTER!!!
 * 
 * Update: YOU HAVE BEEN TURNED!
 * 
 * Important: Send action list after game ends with:
 * * Initial roles
 * * Every turn and action of a player (with round info)
 * * Every vote with who voted for what
 * * End results
 * 
 * Potential idea: Every player gets information except imposter that someone has been successfully turned.
 * 
 * Mayor - To allow us to avoid the 2v2 equal voting forever scenario
 * 
 * TODO: 
 * * Only allow one emoji per person on imposter vote messages
 */


interface ImposterGamePlayerMessage {
  user: User;
  discordMessage: Message;
  reactionAmount: number;
  alive: boolean;
  imposter: boolean;
}
interface IsGameOver {
  gameOver: boolean;
  didImpostersWin?: boolean;
  survivors?: User
}
export class ImposterAction extends BaseCommandClass {
  static instance: ImposterAction = new ImposterAction(commands);
  imposterIndexes: number[];
  timer: number;
  timerMessage: Message;
  voteMessages: ImposterGamePlayerMessage[];
  countDownInterval;
  gameIsOver: boolean;
  activeGame: boolean; // Keep checks on if current game is active

  actionList = [];

  roundTime = 15;
  intervalForCountdownUpdates = 5;
  voteEmoji = {
    name: 'grinning', // TODO: Fix so reaction is the correct one
    icon: '😀'
  }; // 'wazowski'

  /**
   * Countdown timer
   * Remove the one with highest votes each time
   * If imposter remove, win
   */

  isGameOver(): IsGameOver {
    if (this.voteMessages.length <= 1) { // Conceptually should never happen
      return {
        gameOver: true
      };
    }
    const imposterUsers = [];
    const nonImposterUsers = [];
    // Allow counting imposters and nonimposters
    this.voteMessages
      .filter((player: ImposterGamePlayerMessage) => player.alive)
      .forEach((player: ImposterGamePlayerMessage) => player.imposter ? imposterUsers.push(player) : nonImposterUsers.push(player));

    // Check amount
    if (nonImposterUsers.length === 0 || imposterUsers.length === 0) {
      return {
        gameOver: true,
        didImpostersWin: imposterUsers.length > 0
      };
    } else {
      // Check if 2 people left from different teams
      if (nonImposterUsers.length === 1 && imposterUsers.length === 1) {
        return {
          gameOver: true,
          didImpostersWin: true
        }
      } else {
        return {
          gameOver: false
        }
      }
    }
  }

  /**
   * Kill player with most emojis on their name
   */
  killPlayer() {
    // Count emojis
    const emojiCountList = this.voteMessages.map((voteMessage: ImposterGamePlayerMessage) => {
      const reactions = voteMessage.discordMessage.reactions.cache;
      // Check for unique emojis
      const filteredReactions = reactions.filter((reaction: MessageReaction) => {
        console.log('CHECK EMOJI: ', reaction.emoji);
        return reaction.emoji.name === this.voteEmoji.name;
      });
      const reactionAmount = filteredReactions.size;
      console.log('@emojiCount Investigate values:', reactionAmount, reactions, filteredReactions);
      return {
        ...voteMessage,
        reactionAmount: reactionAmount
        // voters: filteredReactions // TODO: Save who voted for this kill
      }
    });

    const sorted = emojiCountList.sort((a1: ImposterGamePlayerMessage, a2: ImposterGamePlayerMessage) => {
      return a2.reactionAmount - a1.reactionAmount;
    });
    console.log('@killPlayer SortedList:', sorted.map((player: ImposterGamePlayerMessage) => {
      return `${player.user.username}: ${player.reactionAmount}`
    }).join('\n'));

    // Check that the top 1 voted has unique amount of votes on them
    if (sorted[0].reactionAmount > sorted[1].reactionAmount) {
      const removedUser: ImposterGamePlayerMessage = sorted[0];
      this.actionList.push(`VoteFinished: ${removedUser.user.username} was voted off with ${removedUser.reactionAmount} votes`);
      
      // Remove this users vote messages
      removedUser.alive = false;
      try {
        console.log('@removedUser Trying to delete:', removedUser.user.username, !!removedUser.discordMessage);
        removedUser.discordMessage?.delete();
      } catch (e) {
        console.error('Issue deleting vote message:', e);
      }
    } else {
      console.log('Equal amount of votes on number 1 and 2!', sorted[0].reactionAmount);
      this.actionList.push(`VoteFailed: Both ${sorted[0].user.username} and ${sorted[1].user.username} had ${sorted[0].reactionAmount} votes, noone was voted off`);
    }

    // Reset emoji reactions
    this.voteMessages.forEach(message => {
      message.discordMessage.reactions.removeAll(); // Don't remove the bot vote, placeholder
    });

    // Check if game is over
    const isGameOver = this.isGameOver();
    console.log('@IsGameOver:', isGameOver);
    return isGameOver;
  }

  // Create the source message with a resetting timer
  countDownTimer(message) {
    this.timer = this.roundTime;
    const baseMessage = 'Imposter Game! Timer:';
    print(message, `${baseMessage} ${this.timer} sec`, (timerMessage) => {
      this.timerMessage = timerMessage;
      this.countDownInterval = setInterval(() => {
        this.timer -= this.intervalForCountdownUpdates;
        console.log('Editing message, timer:', this.timer);
        this.timerMessage.edit( `${baseMessage} ${this.timer} sec`)
        if (this.timer <= 0) {
          // Allow actions between rounds here (each CD to 0 is 1 round)
          const isGameOver: IsGameOver = this.killPlayer();
          if (isGameOver.gameOver) {
            console.log('@countDownTimer: Game is over!');
            this.endGame(isGameOver);
          } else {
            console.log('@countDownTimer: Restarting Timer');
            // Instead of recursive, reset interval here
            this.timer = this.roundTime;
          }
        }
      }, this.intervalForCountdownUpdates * 1000);
    });
  }

  buildGameResults(impostersWon: boolean): string {
    return `*Imposter Game Results*: Winners: ${impostersWon ? '*Imposters*' : '*NonImposters*'}
Actions: 
${this.actionList.join('\n')}`;
  }

  /**
   * Send ending information
   * Reset to allow starting a new game
   */
  endGame(isGameOver: IsGameOver) {
    // Stop intervals
    this.stopGame();
    
    // Finalize final roles
    const impostersWon = isGameOver.didImpostersWin;
    // Do something with survivors here, probably remove the ones that "died" from the 1v1 scenario
    this.voteMessages.filter(player => player.alive).map((player: ImposterGamePlayerMessage) => {
      if (impostersWon && player.imposter || !impostersWon && !player.imposter) {
        this.actionList.push(`Survivor: ${player.user.username} - ${player.imposter ? 'Imposter' : 'Not Imposter'}`);
      }
      return player.user;
    })
    
    // Send result information
    const gameRes = this.buildGameResults(impostersWon);
    console.log('@endGame:', gameRes)
    this.timerMessage.edit(gameRes);
    this.timerMessage = null;
  }

  /** 
   * Stops the ongoing game
   */
  stopGame() {
    // Reset variables
    this.activeGame = false;
    this.voteMessages.forEach(message => {
      message.discordMessage?.delete();
    });
    clearInterval(this.countDownInterval);
  }

  /**
   * Balance amount of imposters based on amount of players in the game
   * TODO: Allow for more than one
   * @param amount 
   * @returns 
   */
  getImposterIndex(amount: number): number[] {
    return [Math.round(Math.random() * amount)];
  }

  action = (message: Message, options: string[]) => {
    if (this.activeGame) {
      print(message, 'Imposter game already ongoing!');
      return;
    }
    this.activeGame = true;
    this.countDownTimer(message);
    const voiceChannel = message.guild.members.cache.get(message.author.id)?.voice?.channel;
    const members: GuildMember[] = Array.from(voiceChannel.members.values());
    const players = [];
    const memberAmount = members.length;
    this.imposterIndexes = this.getImposterIndex(memberAmount);
    this.voteMessages = [];
    members.forEach((member, index) => {
      players.push({
        user: member.user,
        imposter: this.imposterIndexes.includes(index)
      });
    });

    players.forEach(player => {
      const messageText = player.imposter ? '**You are the imposter!**' : 'You are not the imposter!';
      try {
        player.user.send(messageText);  // Private message
      } catch (e) {
        console.error('Issue sending DM!', e);
      }
      this.actionList.push(`InitialRole: ${player.user.username} - ${player.imposter ? 'Imposter' : 'Not Imposter'}`);
      // Generate vote messages for all players in the game
      print(message, `*${player.user.username}*`, (voteMessageDiscord) => {
        voteMessageDiscord.react(this.voteEmoji.icon);
        const voteMessage: ImposterGamePlayerMessage = {
          discordMessage: voteMessageDiscord,
          alive: true,
          reactionAmount: 0,
          user: player.user,
          imposter: player.imposter
        }
        this.voteMessages.push(voteMessage);
      });
    })

  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Run Imposter game with the people in your channel';
  }
}