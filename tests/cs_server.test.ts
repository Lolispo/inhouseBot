'use strict';
// Author: Petter Andersson

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { getClientReference } from '../src/client';
const { gameServers } = require('../src/csserver/cs_server');
const { createPlayer } = require('../src/game/player');
import { getPredictionTeam1 } from '../src/csserver/cs_server';
import { isSayMessage, gameOverMessage } from '../src/csserver/cs_console_stream';

let serverId;
let gameObject;

describe('dathost', () => {
  beforeAll(async () => {
    const res = await gameServers();
    console.log('@dathost.gamesevers:', res);
    serverId = res[0].id;

    // Gameobject
    // createGame
    const player1 = createPlayer('Petter', '1');
    player1.setSteamId('STEAM_1:0:24603593');
    const player2 = createPlayer('Morgan', '2');
    player2.setSteamId('STEAM_0:0:28181825');
    gameObject = {
      team1: [
        player1
      ],
      team2: [
        player2
      ],
      getBalanceInfo: () => {
        return {
          team1Name: 'Team1NameFromFunc',
          team2Name: 'Team2NameFromFunc'
        }
      },
      getChosenMap: () => 'de_inferno',
      setIntervalPassive: (value) => console.log('X'),
    }
    console.log('@SETUP:', gameObject, serverId);
  })
  describe('isSayMessage', () => {
    it('isSayMessage', async () => {
      const s = 'Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"'
      const res = await isSayMessage(s);
      expect(res).toEqual('allchat');
      const res2 = await isSayMessage('not a steam id in this');
      expect(!res2).toBeTruthy();
    });
  });
  describe('gameOverMessage', () => {
    it('gameOverMessage', async () => {
      let s = 'Jun 22 14:41:10: L 06/23/2020 - 22:25:30: Game Over: competitive mg_active de_inferno score 16:13 after 43 min';
      let res = await gameOverMessage(s);
      expect(res).toBeTruthy();
      s = 'Jun 22 14:41:10: L 06/23/2020 - 22:25:30: Game Over: competitive mg_active de_inferno score 16:2 after 43 min';
      res = await gameOverMessage(s);
      expect(res).toBeTruthy();
      const s2 = 'Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "Game Over: competitive mg_active de_inferno score 16:13 after 43 min"';
      const res2 = await gameOverMessage(s2);
      expect(!res2).toBeTruthy();
    });
  });
  describe.skip('readCSConsoleInput', () => {
    /*
    it('readCSConsoleInput', async () => {
      const res = await readCSConsoleInput(serverId, gameObject);
      console.log('@test.readCSConsoleInput:', res);
    });
    */
  });
  describe.skip('configureServer', () => {
    /*
    it('configureServer', async () => {
      const res = await configureServer(gameObject);
      console.log('@test.configureServer:', res);
    })
    */
  })
  describe('getPredictionTeam1', () => {
    it('getPredictionTeam1', async () => {
      const balanceInfo = {
        avgDiff: 0
      }
      const res = await getPredictionTeam1(balanceInfo);
      expect(res).toEqual(50);
    }),
    it('getPredictionTeam1 diff', async () => {
      const balanceInfo = {
        avgDiff: 25,
        avgT1: 2475,
        avgT2: 2525,
      }
      let res = await getPredictionTeam1(balanceInfo);
      expect(res).toEqual(40);
      const balanceInfo2 = {
        avgDiff: 25,
        avgT1: 2525,
        avgT2: 2475,
      }
      res = await getPredictionTeam1(balanceInfo2);
      expect(res).toEqual(60);
    })
  })
  afterAll(() => {
    getClientReference().destroy();
  });
});