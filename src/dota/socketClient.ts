
import io from 'socket.io-client';
import { getGame } from '../game/game';
import { Socket } from "socket.io-client";

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

  socket.on('player ready', () => {
    // TODO
  });

  socket.on('MATCH_FINISHED', (gameId, gameResults) => {
    // TODO
    console.log('@MATCHFINISHED', gameId, gameResults);
    const game = getGame(gameId);
  });
}

export const ready = () =>
  socket.emit('READY');

export const startMatch = teams => {
  socket.emit('start match', teams);
  console.log('@startMatch Sent event', teams);
}


export const initSocketConnection = () => {
  console.log('@Socket Initializing Connection ...');
  socket = io(ipAdress);
  console.log('Socket established!', socket.id);
  return configureSocket;
}