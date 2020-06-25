'use strict';
// Author: Petter Andersson

const assert = require('assert');
const rewire = require('rewire');
const { getConfig } = require('../src/tools/load-environment');
const { gameServers, configureServer } = require('../src/csserver/cs_server');
const { createPlayer } = require('../src/game/player');
const csserverModule = rewire('../src/csserver/cs_server.js');
const cs_console_stream = rewire('../src/csserver/cs_console_stream.js');
const getPredictionTeam1 = csserverModule.__get__('getPredictionTeam1');
const { readCSConsoleInput } = require('../src/csserver/cs_console');
const isSayMessage = cs_console_stream.__get__('isSayMessage'); 
const gameOverMessage = cs_console_stream.__get__('gameOverMessage');

let serverId;
let gameObject;

describe('dathost', () => {
  before(async () => {
    const res = await gameServers();
    console.log('@dathost.gamesevers:', res);
    serverId = res[0].id;

    // Gameobject
    // createGame
    let player1 = createPlayer('Petter', '1');
    player1.setSteamId('STEAM_1:0:24603593');
    let player2 = createPlayer('Morgan', '2');
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
      }
    }
  })
  describe('isSayMessage', () => {
    it('isSayMessage', async () => {
      let s = 'Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "allchat"'
      const res = await isSayMessage(s);
      assert.equal(res, 'allchat');
      const res2 = await isSayMessage('not a steam id in this');
      assert.ok(!res2)
    });
  });
  describe('gameOverMessage', () => {
    it('gameOverMessage', async () => {
      let s = 'L 06/23/2020 - 22:25:30: Game Over: competitive mg_active de_inferno score 16:9 after 43 min';
      const res = await gameOverMessage(s);
      assert.ok(res);
      let s2 = 'Jun 22 14:41:10: L 06/22/2020 - 14:41:10: "Banza1<2><STEAM_1:0:9391834><CT>" say "Game Over: competitive mg_active de_inferno score 16:9 after 43 min"';
      const res2 = await gameOverMessage(s2);
      assert.ok(!res2);
    });
  });
  describe('readCSConsoleInput', () => {
    it('readCSConsoleInput', async () => {
      const res = await readCSConsoleInput(serverId, gameObject);
      console.log('@test.readCSConsoleInput:', res);
    });
  });
  describe('configureServer', () => {
    it('configureServer', async () => {
      const res = await configureServer(gameObject);
      console.log('@test.configureServer:', res);
    })
  })
  describe('getPredictionTeam1', () => {
    it('getPredictionTeam1', async () => {
      const balanceInfo = {
        avgDiff: 0
      }
      const res = await getPredictionTeam1(balanceInfo);
      assert.equal(res, 50);
    }),
    it('getPredictionTeam1 diff', async () => {
      const balanceInfo = {
        avgDiff: 25,
        avgT1: 2475,
        avgT2: 2525,
      }
      let res = await getPredictionTeam1(balanceInfo);
      assert.equal(res, 40);
      const balanceInfo2 = {
        avgDiff: 25,
        avgT1: 2525,
        avgT2: 2475,
      }
      res = await getPredictionTeam1(balanceInfo2);
      assert.equal(res, 60);
    })
  })
});