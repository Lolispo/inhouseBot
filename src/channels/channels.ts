
export enum IKosaTuppChannels {
  KanalGeneral = '102097104322711552',
  Team1 = '442724854832300033',
  Team2 = '442724894980046878',
  LandingZone = '855532642891726888',
  WaitingRoomChannel = '850469231363227668',
}

export const KosaTuppChannelObjects = {
  [IKosaTuppChannels.LandingZone]: { id: '855532642891726888', name: '🛬 Landing Zone' },
  [IKosaTuppChannels.WaitingRoomChannel]: { id: '850469231363227668', name: '🤖 Waiting Room' }
}

const generalId = '102097104322711552'; // General
const testId = '424309421519142913'; // robot-playground

export const getTextTestChannel = () => testId;
export const getTextGeneralChannel = () => generalId;

export const getInhouseFighter = () => 'Inhouse Fighter';