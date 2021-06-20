import { BaseCommandClass } from "./BaseCommand";
import { ConnectDotaAction } from "./commands/game/dota";
import { LoadAction } from "./commands/game/load";
import { SaveAction } from "./commands/game/save";
import { TemperatureCheckAction } from "./commands/game/temperatureCheck";
import { LastGameAction } from "./commands/stats/lastGame";
import { TeammateAction } from "./commands/stats/teammates";


export const allAvailableCommands = (): BaseCommandClass[] => {
  let listOfCommands = [];
  // TODO Load all commands
  listOfCommands.push(LoadAction.instance);
  listOfCommands.push(SaveAction.instance);
  listOfCommands.push(ConnectDotaAction.instance);
  listOfCommands.push(TeammateAction.instance);
  listOfCommands.push(LastGameAction.instance);
  listOfCommands.push(TemperatureCheckAction.instance);
  return listOfCommands;
}

export const buildStringHelpAllCommands = (): string => {
  const commands = allAvailableCommands().filter(command => command.isActive);
  const helpCommands = commands.map(commands => commands.help());
  return helpCommands.join('\n');
}
