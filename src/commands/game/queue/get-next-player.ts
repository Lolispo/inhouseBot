import { Message } from "discord.js";
import { BaseCommandClass } from "../../../BaseCommand";
import { removeBotMessageDefaultTime } from "../../../bot";
import { print, deleteDiscMessage } from "../../../tools/f";
import { getVoiceChannel, setMemberVoice } from "../../../voiceMove";
import { QueueAction } from "./queue";

const commands = ['getnextplayer', 'next', 'queuenext', 'nextqueue', 'getnextqueue'];

export class NextQueuePlayerAction extends BaseCommandClass {
  static instance: NextQueuePlayerAction = new NextQueuePlayerAction(commands);

  /**
   * Removes current players from queue
   */
  action = (message: Message, options: string[]) => {
    const instance = QueueAction.instance;
    const user = instance.getNextPlayer();
    const currentChannel = getVoiceChannel(message, options);
    // Unite if available
    try {
      setMemberVoice([user], currentChannel.id)
    } catch (e) {
      console.log('User not movable into channel');
      user.send('**Inhouse time! You are being summoned! Join discord.\nIf you are not able to join soon, you will lose your spot.**')
      .then(result => {
        deleteDiscMessage(result, removeBotMessageDefaultTime * 2);
      });
      deleteDiscMessage(message, 10000, 'queuepop');
    }
    // If not available in channel, DM
    deleteDiscMessage(message, 15000, 'nextqueue');
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Move next player in queue to current channel. If not available DMs them';
  }
}