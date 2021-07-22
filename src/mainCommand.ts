import { BaseCommandClass } from "./BaseCommand";
import { ConnectDotaAction } from "./commands/game/dota";
import { LastGameAction } from "./commands/stats/lastGame";
import { LennyAction } from "./commands/memes/lenny";
import { LoadAction } from "./commands/game/load";
import { RollAction } from "./commands/memes/roll";
import { SaveAction } from "./commands/game/save";
import { TeammateAction } from "./commands/stats/teammates";
import { TemperatureCheckAction } from "./commands/game/temperatureCheck";


export const allAvailableCommands = (): BaseCommandClass[] => {
  let listOfCommands = [];
  // TODO Load all commands
  listOfCommands.push(ConnectDotaAction.instance);
  listOfCommands.push(LastGameAction.instance);
  listOfCommands.push(LennyAction.instance);
  listOfCommands.push(LoadAction.instance);
  listOfCommands.push(RollAction.instance);
  listOfCommands.push(SaveAction.instance);
  listOfCommands.push(TeammateAction.instance);
  listOfCommands.push(TemperatureCheckAction.instance);
  return listOfCommands;
}

export const buildStringHelpAllCommands = (): string => {
  const commands = allAvailableCommands().filter(command => command.isActive);
  const helpCommands = commands.map(commands => commands.help());
  return helpCommands.join('\n');
}
