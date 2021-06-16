
import io from 'socket.io-client';
import { getGame, getGameByGameId } from '../game/game';
import { Socket } from "socket.io-client";
import { ITeamWon } from './dotatypes';
import { ConnectDotaAction } from '../commands/game/dota';

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
    // TODO: SPLIT
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

    // TODO
    // Unite team
    // Update mmr
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