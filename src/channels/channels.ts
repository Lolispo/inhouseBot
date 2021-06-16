
export enum IKosaTuppChannels {
  KanalGeneral = '102097104322711552',
  Team1 = '442724854832300033',
  Team2 = '442724894980046878'
}

const generalId = '102097104322711552'; // General
const testId = '424309421519142913'; // robot-playground

export const getTextTestChannel = () => testId;
export const getTextGeneralChannel = () => generalId;

export const getInhouseFighter = () => 'Inhouse Fighter';