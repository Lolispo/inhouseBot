
import io from 'socket.io-client';
import { cleanOnGameEnd, Game, getGame, getGameByGameId } from '../game/game';
import { Socket } from "socket.io-client";
import { DotaBotResultTranslate, ITeamWon } from './dotatypes';
import { ConnectDotaAction } from '../commands/game/dota';
import { split, unite } from '../voiceMove';
import { updateMMR } from '../game/mmr';
import { removeBotMessageDefaultTime } from '../bot';
import { deleteDiscMessage } from '../tools/f';

const ipAdress = 'http://127.0.0.1:4545';
let socket: Socket;

export const configureSocket = () => {
  // make sure our socket is connected to the port
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('SPLIT_DISCORD', () => {
    // Split teams
    const gameId = ConnectDotaAction.getGameId();
    console.log('@MATCH FINISHED GAMEID:', gameId);
    const gameObject = getGameByGameId(ConnectDotaAction.getGameId());
    split(gameObject.getChannelMessage(), [], gameObject.getBalanceInfo(), gameObject.getActiveMembers());
  });

  socket.on('MATCH', (whoWon: ITeamWon, matchId: string) => {
    console.log('@MATCH DEBUG:', whoWon, matchId);
  })

  /**
   * matchId = Steam id of the game
   * gameResults: ITeamWon - Unknown errors or Radiant or Dire
   * Radiant = Team1 Victory
   * Dire = Team2 Victory
   */
  socket.on('MATCH_FINISHED', (matchId: string, gameResult: ITeamWon) => {
    console.log('@MATCHFINISHED', matchId, gameResult);
    const gameId = ConnectDotaAction.getGameId();
    console.log('@MATCH FINISHED GAMEID:', gameId);
    const gameObject = getGameByGameId(ConnectDotaAction.getGameId());
    unite(gameObject.getChannelMessage(), [], gameObject.getActiveMembers());
    const winner = DotaBotResultTranslate(gameResult);
    if (winner) {
      console.log('@Updating MMR after bot results:', winner);
      updateMMR(winner, gameObject, (message) => {
        console.log('DEBUG @callbackGameFinished - Calls on exit after delete on this message');
        deleteDiscMessage(message, removeBotMessageDefaultTime * 4, 'gameFinished');
        cleanOnGameEnd(gameObject);
      });
    } else {
      console.error('Unknown result returned by the Dota bot:', winner, gameResult, matchId);
    }
  });
}

export const ready = () =>
  socket.emit('READY');

export const startMatch = teams => {
  socket.emit('START_MATCH', teams);
  console.log('@startMatch Sent event', teams);
}

/**
 * Send me back information on MATCH event about current match
 */
export const fetchMatch = () => {
  socket.emit('FETCH_MATCH');
}

export const cancelMatch = () => {
  socket.emit('CANCEL_MATCH');
  console.log('@cancelMatch Match in dota bot cancelled');
}

export const initSocketConnection = () => {
  console.log('@Socket Initializing Connection ...');
  socket = io(ipAdress);
  console.log('Socket established!', socket.id);
  return configureSocket;
}