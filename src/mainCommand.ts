import { BaseCommandClass } from "./BaseCommand";
import { LoadAction } from "./commands/game/load";
import { SaveAction } from "./commands/game/save";


export const allAvailableCommands = (): BaseCommandClass[] => {
  let listOfCommands = [];
  // TODO Load all commands
  listOfCommands.push(LoadAction.instance, false);
  listOfCommands.push(SaveAction.instance, false);
  return listOfCommands;
}

export const buildStringHelpAllCommands = (): string => {
  const commands = allAvailableCommands();
  const helpCommands = commands.map(commands => commands.help());
  return helpCommands.join('\n');
}
