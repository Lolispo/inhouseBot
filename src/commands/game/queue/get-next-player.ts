import { Message, User } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { MatchMode } from "../../../BaseCommandTypes";
import { removeBotMessageDefaultTime } from "../../../bot";
import { print, deleteDiscMessage } from "../../../tools/f";
import { getVoiceChannel, setMemberVoice } from "../../../voiceMove";
import { QueueAction } from "./queue";

const commands = ['pop', 'getnextplayer', 'next', 'queuenext', 'nextqueue', 'getnextqueue'];

export class NextQueuePlayerAction extends BaseCommandClass {
  static instance: NextQueuePlayerAction = new NextQueuePlayerAction(commands, { matchMode: MatchMode.STARTS_WITH });

  /**
   * Removes current players from queue
   */
  action = async (message: Message, options: string[]) => {
    const instance = QueueAction.instance;
    let amountToPop = 1;
    const optionAmountToPop = parseInt(options[1])
    if (!isNaN(optionAmountToPop) && optionAmountToPop > 0 && optionAmountToPop < 10) {
      amountToPop = optionAmountToPop;
    }
    console.log('AmountToPop:', amountToPop, optionAmountToPop);

    for (let i = 0; i < amountToPop; i++) {
      const user = instance.getNextPlayer();
  
      if (user) {
        const authorUser = message.guild?.member(message.author.id);
        const foundUser = message.guild?.member(user.id);
        const currentChannel = getVoiceChannel(message, [], authorUser?.voice?.channelID);
        // Get user with voice information

        // Drag user into channel if available in voice, otherwise DM them
        try {
          console.log('DEBUG: Before command', amountToPop, currentChannel?.id);
          await setMemberVoice([foundUser], currentChannel?.id)
          console.log('DEBUG: After command', amountToPop, currentChannel?.id);
        } catch (e) {
          console.log('DEBUG: User not movable into channel', e);
          this.summonUser(user);
          deleteDiscMessage(message, 10000, 'queuepop');
        }
        print(message, `**${user.username}** joins to play!`, (messageVar) => {
          deleteDiscMessage(messageVar, 15000, 'queuejoin')
        }); // TODO: Variations
        deleteDiscMessage(message, 15000, 'nextqueue');
      } else {
        print(message, 'No user in queue', (messageVar) => {
          deleteDiscMessage(messageVar, 15000, 'queuenouser')
        });
        break;
      }
    }
  }

  summonUser(user: User) {
    // Sends DM if not in voice
    user.send('**Inhouse time! You are being summoned! Join discord.\nIf you are not able to join soon, you will lose your spot.**')
    .then(result => {
      deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
    });
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Move next player in queue to current channel. If not available DMs them';
  }
}