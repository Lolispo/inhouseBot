import { BaseCommandClass } from "./BaseCommand";
import { ConnectDotaAction } from "./commands/game/dota";
import { LoadAction } from "./commands/game/load";
import { SaveAction } from "./commands/game/save";


export const allAvailableCommands = (): BaseCommandClass[] => {
  let listOfCommands = [];
  // TODO Load all commands
  listOfCommands.push(LoadAction.instance);
  listOfCommands.push(SaveAction.instance);
  listOfCommands.push(ConnectDotaAction.instance);
  return listOfCommands;
}

export const buildStringHelpAllCommands = (): string => {
  const commands = allAvailableCommands();
  const helpCommands = commands.map(commands => commands.help());
  return helpCommands.join('\n');
}
