import { Message } from "discord.js";
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
  action = (message: Message, options: string[]) => {
    const instance = QueueAction.instance;
    let amountToPop = 1;
    const optionAmountToPop = parseInt(options[1])
    if (!isNaN(optionAmountToPop) && optionAmountToPop > 0 && optionAmountToPop < 10) {
      amountToPop = optionAmountToPop;
    }

    for (let i = 0; i < amountToPop; i++) {
      const user = instance.getNextPlayer();
  
      if (user) {
        const authorUser = message.guild.member(message.author.id);
        const foundUser = message.guild.member(user.id);
        const currentChannel = getVoiceChannel(message, options, authorUser.voice.channelID);
        // Get user with voice information
    
        // Unite if available
        try {
          setMemberVoice([foundUser], currentChannel.id);
          print(message, `**${user.username}** joins to play!`, (messageVar) => {
            deleteDiscMessage(messageVar, 15000, 'queuejoin')
          }); // TODO: Variations
        } catch (e) {
          console.log('User not movable into channel');
          // Sends DM if not in voice
          user.send('**Inhouse time! You are being summoned! Join discord.\nIf you are not able to join soon, you will lose your spot.**')
            .then(result => {
              deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
            });
          deleteDiscMessage(message, 10000, 'queuepop');
        }
        deleteDiscMessage(message, 15000, 'nextqueue');
      } else {
        print(message, 'No user in queue', (messageVar) => {
          deleteDiscMessage(messageVar, 15000, 'queuenouser')
        });
        break;
      }
    }
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Move next player in queue to current channel. If not available DMs them';
  }
}