'use strict';
// Author: Petter Andersson

const assert = require('assert');
const rewire = require('rewire');
const { gameServers } = require('../src/csserver/cs_server');
const { createPlayer } = require('../src/game/player');
const csserverModule = rewire('../src/csserver/cs_server.js');
const cs_console_stats = rewire('../src/csserver/cs_server_stats.js');
const getPredictionTeam1 = csserverModule.__get__('getPredictionTeam1');
const { getGameStats } = require('../src/csserver/cs_server_stats');


let serverId;
let gameObject;


describe('server_stats', function(){
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
      },
      getChannelMessage: () => {
        
      }
    }
  })
  describe('getGameStats', () => {
    it('getGameStats', async () => {
      const stats = await getGameStats(serverId, gameObject);
      console.log('@test.stats', stats);
    });
  });
});