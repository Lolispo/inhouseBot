
import { Message } from "discord.js";
import { BaseCommandClass } from "../../BaseCommand/BaseCommand";
import { print } from "../../tools/f";

const { exec } = require("child_process");
const commands = ['restartdotabot', 'restartdotesbot']

export class RestartDotaBotAction extends BaseCommandClass {
  static instance: RestartDotaBotAction = new RestartDotaBotAction(commands, { isActive: true, adminCommand: true });

  // This command only works if running on a linux system where also the bot is active
  // The command is useful because the dotes bot is for some reason timing out
  action = async (message: Message, options: string[]) => {
    console.log('@RestartDotaBotAction');
    exec('sh ./restartDotesBot.sh', (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
      print(message, 'Restarted Dota Bot');
  });
  }

  help = () => {
    return '**' + this.commands.toString().replace(/,/g, ' | ') + '** Restart Dota bot';
  }
}
