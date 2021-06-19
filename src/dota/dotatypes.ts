
export enum DOTA_GC_TEAM {
  GOOD_GUYS = 0,
  BAD_GUYS = 1,
  BROADCASTER = 2,
  SPECTATOR = 3,
  PLAYER_POOL = 4,
  NOTEAM = 5
}

export interface IDotaStartMatch {
  [DOTA_GC_TEAM.GOOD_GUYS]: number[],
  [DOTA_GC_TEAM.BAD_GUYS]: number[],
}

export enum ITeamWon {
  RADIANT = 'Radiant',
  DIRE = 'Dire',
  Unknown = 'Unknown'
}

export interface IMatchFinished {
  whoWon: ITeamWon,
  matchid: string
}

// 0 => tie, 1 => team1, 2 => team2
export const DotaBotResultTranslate = (result: ITeamWon): number => {
  if (result === ITeamWon.RADIANT) return 1;
  if (result === ITeamWon.DIRE) return 2;
  if (result === ITeamWon.Unknown)
    return undefined;
}