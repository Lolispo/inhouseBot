import { GuildMember, Message, User } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { print } from "../../tools/f";

const commands = ['imposter'];


interface VoteMessage {
  user: User;
  discordMessage: Message;
  reactionAmount: number;
  alive: boolean;
}

export class ImposterAction extends BaseCommandClass {
  static instance: ImposterAction = new ImposterAction(commands);
  imposterIndexes: number[];
  timer: number;
  timerMessage: Message;
  voteMessages: VoteMessage[];
  countDownInterval;
  gameIsOver: boolean;

  /**
   * Countdown timer
   * Remove the one with highest votes each time
   * If imposter remove, win
   */


  isGameOver(): boolean {
    if (this.voteMessages.length <= 1) {
      return true;
    }
    let imposterUsers = [];
    let nonImposterUsers = [];
    for (let i = 0; i < this.voteMessages.length; i++) {
      if (this.voteMessages[i].alive) {
        this.imposterIndexes.includes(i) ? imposterUsers.push(this.voteMessages[i]) : nonImposterUsers.push(this.voteMessages[i]) ;
      }
    }

    // Check amount
    // TODO
    if (nonImposterUsers.length === 0) {
      return true
    } else {
      return false; // TODO
    }
  }

  /**
   * Kill player with most emojis on their name
   */
  killPlayer() {
    // Count emojis
    const emojiCountList = this.voteMessages.map((voteMessage: VoteMessage) => {
      const reactionAmount = voteMessage.discordMessage.reactions.cache.size;
      return {
        ...voteMessage,
        reactionAmount: reactionAmount
      }
    })
    const sorted = emojiCountList.sort((a1: VoteMessage, a2: VoteMessage) => {
      return a1.reactionAmount - a2.reactionAmount;
    });
    console.log('SortedList:', sorted.map((player: VoteMessage) => {
      return `${player.user.username}: ${player.reactionAmount}\n`
    }));

    const removedUser: VoteMessage = sorted[0];
    
    // Remove this users vote messages
    removedUser.alive = false;
    try {
      removedUser.discordMessage.delete();
    } catch (e) {
      console.error('Issue deleting vote message:', e);
    }

    // Check if game is over
    return this.isGameOver();
  }

  // Create the source message with a resetting timer
  countDownTimer(message) {
    this.timer = 30;
    const baseMessage = 'Imposter Game! Timer:';
    print(message, `${baseMessage} ${this.timer} sec`, (timerMessage) => {
      this.timerMessage = timerMessage;
      this.timer =- 5;
      if (this.timer <= 0) {
        const gameIsOver = this.killPlayer(); // Returns true if gameover
        if (gameIsOver) {

        } else {
          this.countDownTimer(message);
        }
      } else {
        this.countDownInterval = setInterval(() => {
          this.timerMessage.edit( `${baseMessage} ${this.timer} sec`)
        }, 5000);
      }
    });
  }

  stopGame() {
    clearInterval(this.countDownInterval);
  }

  getImposterIndex(amount: number): number[] {
    return [Math.round(Math.random() * amount)];
  }

  action = (message: Message, options: string[]) => {
    this.countDownTimer(message);
    const voiceChannel = message.guild.member(message.author)?.voice?.channel;
    const members: GuildMember[] = Array.from(voiceChannel.members.values());
    let players = [];
    const memberAmount = members.length;
    this.imposterIndexes = this.getImposterIndex(memberAmount);
    members.forEach((member, index) => {
      players.push({
        user: member.user,
        imposter: this.imposterIndexes.includes(index)
      });
    });

    players.forEach(player => {
      const message = player.imposter ? '**You are the imposter!**' : 'You are not the imposter!';
      try {
        player.user.send(message);  // Private message
      } catch (e) {
        console.error('Issue sending DM!', e);
      }
    })
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Run Imposter game with the people in your channel';
  }
}