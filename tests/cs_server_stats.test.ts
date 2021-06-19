'use strict';
// Author: Petter Andersson

import { describe, it, before } from 'mocha';
import { getMockStats } from './gameMock.test';
const { gameServers } = require('../src/csserver/cs_server');
const { createPlayer } = require('../src/game/player');
const { getGameStats, buildStatsMessage, sendStatsDiscord, playerMapSteamIdStats } = require('../src/csserver/cs_server_stats');
const { getTextChannel, getClient } = require('../src/client');


let serverId;
let gameObject;
let stats;
let stats2;


describe('server_stats', () => {
  before(async () => {
    // await getClient('test');
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
      getBalanceInfo: () => {
        return {
          team1Name: 'Team1NameFromFunc',
          team2Name: 'Team2NameFromFunc',
          team1: [
            player2
          ],
          team2: [
            player1
          ],
        }
      },
      getChannelMessage: async () => {
        return {
        }
      },
      getMatchId: () => 'test',
      setIntervalPassive: (value) => console.log('X'),
    }
    const mockStats = getMockStats();
    stats = mockStats.stats;
    stats2 = mockStats.stats2;
  });
  describe('getGameStats', () => {
    it('getGameStats', async () => {
      // Deactivated when MMR update is live from result - mock game result data to enable
      const stats = await getGameStats(serverId, gameObject);
      console.log('@test.stats', stats);
    });
  });
  
  describe('buildstats', () => {
    it('buildStatsMessage', async () => {
      const discordMessage = buildStatsMessage(stats);
      console.log('buildStatsMessage Test result:', discordMessage);
      // sendStatsDiscord(gameObject, discordMessage);
    });
    it('buildstats2', async () => {
      const discordMessage = buildStatsMessage(stats2);
      console.log('buildStatsMessage Test result:', discordMessage);
    });
  });
  describe('playerMapSteamIdStats', () => {
    it('playerMapSteamIdStats1', async () => {
      const playerMappedStats = playerMapSteamIdStats(gameObject, stats);
      console.log('TEST:', playerMappedStats);
      
    });
    it('playerMapSteamIdStats2', async () => {
      const playerMappedStats = playerMapSteamIdStats(gameObject, stats2);
      console.log(playerMappedStats);
    });
  });
});

/* 
  { team1:
    { '2':
        { roundsplayed: '40',
          name: 'Morgan',
          damage: '4339',
          firstkill_t: '6',
          kills: '37',
          headshot_kills: '10',
          '3kill_rounds': '2',
          v2: '1',
          assists: '11',
          '2kill_rounds': '9',
          deaths: '24',
          '1kill_rounds': '13',
          firstdeath_t: '3',
          tradekill: '2',
          flashbang_assists: '1',
          bomb_plants: '2',
          bomb_defuses: '1',
          v1: '1',
          firstkill_ct: '6',
          firstdeath_ct: '3',
          uid: '2' } },
    team2:
    { '1':
        { roundsplayed: '40',
          name: 'Petter',
          damage: '3838',
          firstkill_ct: '7',
          kills: '43',
          headshot_kills: '18',
          deaths: '2',
          '3kill_rounds': '6',
          assists: '3',
          '2kill_rounds': '6',
          '1kill_rounds': '13',
          bomb_defuses: '1',
          tradekill: '4',
          bomb_plants: '1',
          firstkill_t: '5',
          firstdeath_t: '1',
          v1: '1',
          uid: '1' } } }
*/