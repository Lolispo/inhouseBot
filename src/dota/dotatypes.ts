
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
