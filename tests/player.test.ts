'use strict';
// Author: Petter Andersson

import { afterAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../src/client';
import { sortRating, createPlayer } from '../src/game/player';

// TODO
describe('player', function(){
  describe('CreatePlayer', function(){
    const userName = 'TestUser';
    const discId = '1';
    const p = createPlayer(userName, discId);
    it('should store username correctly', function(){
        expect(userName).toEqual(p.userName);
    });
  });
  describe('sortRating', () => {
    const players = [];
    const game = 'test';
    for (let i = 0; i < 5; i++) {
      const player = createPlayer('Test' + i, i);
      player.setMMR(game, 10 * i);
      players.push(player);
    }
    // console.log('Players:', players.map(player => player.getMMR(game)));
    const sortedPlayers = sortRating(players, game);
    // console.log('@sortedPlayers:', sortedPlayers);
    expect(sortedPlayers[0].userName).toEqual('Test4');
  })
  afterAll(() => {
    getClientReference().destroy();
  });  
})