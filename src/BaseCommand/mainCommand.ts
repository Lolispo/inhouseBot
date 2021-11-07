import { AddInhouseFighterRole } from "../commands/meta/inhouse-fighter-role-add";
import { BaseCommandClass } from "./BaseCommand";
import { ConnectDotaAction } from "../commands/game/dota";
import { CSServerAddressAction } from "../commands/game/cs-server-address";
import { CurrentQueueAction } from "../commands/game/queue/currentqueue";
import { EmptyQueueAction } from "../commands/game/queue/empty-queue";
import { HejAction } from "../commands/memes/hej";
import { HelpAction } from "../commands/meta/help";
import { HelpAllAction } from "../commands/meta/helpAll";
import { ImposterAction } from "../commands/game/imposter";
import { LastGameAction } from "../commands/stats/lastGame";
import { LeaderboardAction } from "../commands/stats/leaderboard";
import { LennyAction } from "../commands/memes/lenny";
import { LoadAction } from "../commands/game/load";
import { NextQueuePlayerAction } from "../commands/game/queue/get-next-player";
import { QueueAction } from "../commands/game/queue/queue";
import { RestartDotaBotAction } from "../commands/game/restart-dota-bot";
import { RollAction } from "../commands/memes/roll";
import { RollbackQueue } from "../commands/game/queue/rollback-queue";
import { SaveAction } from "../commands/game/save";
import { SplitAction } from "../commands/game/voice/split";
import { StopQueueAction } from "../commands/game/queue/stop-queue";
import { TeammateAction } from "../commands/stats/teammates";
import { TemperatureCheckAction } from "../commands/game/temperatureCheck";
import { UniteAction } from "../commands/game/voice/unite";
import { HelpMode, IMessageType } from "./BaseCommandTypes";

let listOfCommands: BaseCommandClass[];

export const allAvailableCommands = (): BaseCommandClass[] => {
  if (!listOfCommands) {
    let listOfCommands = [];
    listOfCommands.push(AddInhouseFighterRole.instance);
    listOfCommands.push(ConnectDotaAction.instance);
    listOfCommands.push(CSServerAddressAction.instance);
    listOfCommands.push(CurrentQueueAction.instance);
    listOfCommands.push(EmptyQueueAction.instance);
    listOfCommands.push(HejAction.instance);
    listOfCommands.push(HelpAction.instance);
    listOfCommands.push(HelpAllAction.instance);
    listOfCommands.push(ImposterAction.instance);
    listOfCommands.push(LastGameAction.instance);
    listOfCommands.push(LeaderboardAction.instance);
    listOfCommands.push(LennyAction.instance);
    listOfCommands.push(LoadAction.instance);
    listOfCommands.push(NextQueuePlayerAction.instance);
    listOfCommands.push(QueueAction.instance);
    listOfCommands.push(RestartDotaBotAction.instance);
    listOfCommands.push(RollAction.instance);
    listOfCommands.push(RollbackQueue.instance);
    listOfCommands.push(SaveAction.instance);
    listOfCommands.push(SplitAction.instance);
    listOfCommands.push(StopQueueAction.instance);
    listOfCommands.push(TeammateAction.instance);
    listOfCommands.push(TemperatureCheckAction.instance);
    listOfCommands.push(UniteAction.instance);
    // Sorted so that exact matches are evaluated before starting matches
    listOfCommands.sort((a: BaseCommandClass, b: BaseCommandClass) => {
      return a.matchMode - b.matchMode;
    });
    return listOfCommands;
  } else {
    return listOfCommands;
  }
}

/**
 * Returns a concatenated string of all help commands
 * Sort order:
 *  Commands that require active game come after normal commands
 *   within those, admin commands come last
 *    Otherwise alphabetically sorted A-Z
 * @param detailed boolean to choose mode to return detailed description of command if available
 * @returns string of all help commands
 */
export const buildStringHelpAllCommands = (helpMode: HelpMode = HelpMode.NORMAL): string => {
  const commands = allAvailableCommands().filter(command => command.isActive && command.includeHelpCommand);
  // Sort list of commands based on required active game or not
  const sortedCommands = commands.sort((a: BaseCommandClass, b: BaseCommandClass) => {
    // Sort Commands where game are required last
    if ((a.requireActiveGame && b.requireActiveGame) || (!a.requireActiveGame && !b.requireActiveGame)) {
      if ((a.adminCommand && b.adminCommand) || (!a.adminCommand && !b.adminCommand)) {
        // Sort on title Alphabetically
        return a.name.localeCompare(b.name);
      }
      if (a.adminCommand) return 1;
      else if (b.adminCommand) return -1;
      return 0;
    }
    // Not required game commands first
    if (a.requireActiveGame) return 1;
    else if (b.requireActiveGame) return -1;
    return 0;
  });
  const helpCommands = sortedCommands.map(command => command.help(helpMode));
  return helpCommands.join('\n');
}

/**
 * Returns all commands available in direct message
 * @returns array of command names
 */
export const getAllDmCommands = (): string[] => {
  return allAvailableCommands()
    .filter(command => command.allowedMessageTypes.includes(IMessageType.DIRECT_MESSAGE))
    .map(command => command.commands)
    .map(commandList => commandList.toString());
}
