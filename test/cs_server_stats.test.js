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
const buildStatsMessage = cs_console_stats.__get__('buildStatsMessage');
const sendStatsDiscord = cs_console_stats.__get__('sendStatsDiscord');
const { getTextChannel, getClient } = require('../src/client');
const playerMapSteamIdStats = cs_console_stats.__get__('playerMapSteamIdStats');


let serverId;
let gameObject;
let stats;
let stats2;


describe('server_stats', function(){
  before(async () => {
    // await getClient('test');
    const res = await gameServers();
    console.log('@dathost.gamesevers:', res);
    serverId = res[0].id;

    // Gameobject
    // createGame
    let player1 = createPlayer('Petter', '1');
    player1.setSteamId('STEAM_1:0:24603593');
    let player2 = createPlayer('Morgan', '2');
    player2.setSteamId('STEAM_0:0:28181825');
    /*const textChannel = await getTextChannel();
    console.log('TEXT', {
      ...textChannel,
    });*/
    gameObject = {
      /*
      team1: [
        player1
      ],
      team2: [
        player2
      ],*/
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
      }
    }
    stats = { 
      series_type: 'bo1',
      team1_name: 'Morgan + 4 Elephants',
      team2_name: 'Petter + 4 Villians',
      map0:
        { 
          team1: { '76561198044125547':
          { roundsplayed: '40',
            name: 'Ahoy!',
            deaths: '28',
            firstdeath_t: '5',
            damage: '2172',
            assists: '9',
            firstkill_t: '2',
            kills: '19',
            '1kill_rounds': '7',
            bomb_plants: '3',
            '2kill_rounds': '6',
            tradekill: '2',
            headshot_kills: '9',
            flashbang_assists: '1',
            firstkill_ct: '2',
            firstdeath_ct: '2' },
          '76561197965168031':
          { roundsplayed: '40',
            name: 'Aios',
            damage: '2800',
            kills: '25',
            headshot_kills: '13',
            deaths: '28',
            '1kill_rounds': '11',
            firstkill_t: '7',
            '2kill_rounds': '4',
            firstdeath_t: '6',
            bomb_plants: '2',
            assists: '6',
            tradekill: '1',
            '3kill_rounds': '2',
            firstkill_ct: '2',
            firstdeath_ct: '6',
            flashbang_assists: '1' },
          '76561197961614476':
          { roundsplayed: '40',
            name: 'Knas',
            bomb_plants: '2',
            deaths: '24',
            damage: '3810',
            kills: '37',
            '1kill_rounds': '13',
            firstkill_t: '5',
            headshot_kills: '15',
            '3kill_rounds': '4',
            firstdeath_t: '5',
            assists: '7',
            '2kill_rounds': '2',
            firstkill_ct: '6',
            '4kill_rounds': '2',
            firstdeath_ct: '3',
            bomb_defuses: '1',
            tradekill: '1' },
          '76561197973327397':
          { roundsplayed: '40',
            name: 'PAraflaXet',
            damage: '2709',
            assists: '7',
            flashbang_assists: '2',
            kills: '24',
            headshot_kills: '8',
            deaths: '26',
            '1kill_rounds': '16',
            firstdeath_t: '1',
            firstdeath_ct: '3',
            firstkill_ct: '3',
            tradekill: '3',
            '2kill_rounds': '4',
            bomb_plants: '1' },
          '76561198016629378':
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
            firstdeath_ct: '3' },
          score: '22' },
          team2: { '76561197979049396':
          { roundsplayed: '40',
            name: 'Banza1',
            damage: '2101',
            deaths: '30',
            tradekill: '2',
            kills: '14',
            headshot_kills: '7',
            '2kill_rounds': '2',
            '1kill_rounds': '10',
            firstdeath_ct: '2',
            firstkill_ct: '2',
            assists: '6',
            firstdeath_t: '5',
            firstkill_t: '2',
            bomb_plants: '1' },
          '76561197976312675':
          { roundsplayed: '40',
            name: 'Bambi på hal is',
            damage: '3121',
            deaths: '26',
            firstdeath_ct: '8',
            kills: '28',
            headshot_kills: '7',
            '3kill_rounds': '4',
            bomb_defuses: '1',
            firstkill_ct: '2',
            assists: '6',
            '2kill_rounds': '3',
            '1kill_rounds': '10',
            firstkill_t: '5',
            firstdeath_t: '5',
            bomb_plants: '3',
            tradekill: '2',
            flashbang_assists: '1' },
          '76561197999085950':
          { roundsplayed: '40',
            name: 'Banan',
            damage: '2085',
            deaths: '31',
            firstkill_ct: '3',
            kills: '10',
            headshot_kills: '6',
            '1kill_rounds': '10',
            assists: '8',
            firstdeath_ct: '6',
            firstdeath_t: '4',
            firstkill_t: '1' },
          '76561198009472914':
          { roundsplayed: '40',
            name: 'Petter',
            damage: '3838',
            firstkill_ct: '7',
            kills: '43',
            headshot_kills: '18',
            deaths: '2', // 24
            '3kill_rounds': '6',
            assists: '3',
            '2kill_rounds': '6',
            '1kill_rounds': '13',
            bomb_defuses: '1',
            tradekill: '4',
            bomb_plants: '1',
            firstkill_t: '5',
            firstdeath_t: '1',
            v1: '1' },
          '76561197975080136':
          { roundsplayed: '40',
            name: 'CATKNIFE',
            damage: '3947',
            kills: '35',
            headshot_kills: '13',
            deaths: '31',
            '1kill_rounds': '11',
            firstdeath_ct: '4',
            '2kill_rounds': '7',
            assists: '8',
            '4kill_rounds': '1',
            firstkill_ct: '6',
            '3kill_rounds': '2',
            firstdeath_t: '4',
            tradekill: '2',
            firstkill_t: '4',
            bomb_plants: '3' },
          score: '18' 
        },
        mapname: 'de_inferno',
        winner: 'team1',
        demo_filename: '1_map1_de_inferno.dem' 
      },
      winner: 'team1' 
    };

    stats2 = 
      { series_type: 'bo1',
        team1_name: 'Bambi på hal is + 4 Alpacas',
        team2_name: '4 Trash Cans and edgy Lacktjo',
        map0:
         { team2: { '76561197973327397':
         { roundsplayed: '20',
           name: 'PAraflaXet',
           damage: '1824',
           kills: '19',
           headshot_kills: '9',
           '1kill_rounds': '10',
           firstkill_ct: '3',
           deaths: '5',
           assists: '5',
           '2kill_rounds': '3',
           flashbang_assists: '2',
           tradekill: '1',
           firstdeath_ct: '1',
           bomb_plants: '1',
           firstkill_t: '1',
           '3kill_rounds': '1' },
        '76561198009472914':
         { roundsplayed: '20',
           name: 'Petter',
           damage: '2769',
           tradekill: '3',
           kills: '26',
           headshot_kills: '11',
           '2kill_rounds': '7',
           deaths: '7',
           firstkill_ct: '3',
           firstdeath_ct: '1',
           assists: '3',
           '1kill_rounds': '9',
           '3kill_rounds': '1',
           firstkill_t: '3' },
        '76561197975080136':
         { roundsplayed: '20',
           name: 'CATKNIFE',
           damage: '1337',
           firstkill_ct: '2',
           kills: '11',
           headshot_kills: '4',
           assists: '5',
           '1kill_rounds': '7',
           deaths: '7',
           firstdeath_ct: '2',
           tradekill: '1',
           '2kill_rounds': '2',
           firstdeath_t: '1',
           bomb_plants: '1',
           flashbang_assists: '2' },
        '76561198018542419':
         { roundsplayed: '20',
           name: 'Lacktjo',
           damage: '1519',
           kills: '14',
           headshot_kills: '4',
           '1kill_rounds': '12',
           deaths: '10',
           assists: '4',
           '2kill_rounds': '1',
           firstdeath_ct: '3',
           firstkill_ct: '2',
           tradekill: '1',
           firstkill_t: '1',
           bomb_plants: '1',
           firstdeath_t: '1' },
        '76561197960498877':
         { roundsplayed: '20',
           name: 'henks',
           damage: '2199',
           deaths: '9',
           firstdeath_ct: '5',
           assists: '1',
           kills: '23',
           '1kill_rounds': '4',
           firstkill_ct: '5',
           '2kill_rounds': '5',
           headshot_kills: '6',
           '3kill_rounds': '3',
           firstdeath_t: '1',
           bomb_plants: '1' },
        score: '16' },
           team1: { '76561197976312675':
           { roundsplayed: '20',
             name: 'Bambi på hal is',
             damage: '1112',
             deaths: '19',
             firstkill_t: '5',
             kills: '10',
             bomb_plants: '1',
             headshot_kills: '7',
             '3kill_rounds': '1',
             v2: '1',
             firstdeath_t: '7',
             '1kill_rounds': '5',
             flashbang_assists: '1',
             '2kill_rounds': '1',
             firstdeath_ct: '3' },
          '76561198044125547':
           { roundsplayed: '20',
             name: 'Ahoy!',
             deaths: '17',
             firstdeath_t: '3',
             damage: '699',
             firstkill_t: '2',
             kills: '4',
             headshot_kills: '3',
             assists: '4',
             bomb_plants: '2',
             '2kill_rounds': '1',
             v1: '1',
             '1kill_rounds': '2',
             flashbang_assists: '1' },
          '76561198017358641':
           { roundsplayed: '20',
             name: 'NOWIS',
             damage: '1043',
             deaths: '19',
             kills: '12',
             '1kill_rounds': '6',
             '2kill_rounds': '3',
             headshot_kills: '7',
             firstdeath_t: '1',
             firstkill_t: '3',
             tradekill: '2',
             firstdeath_ct: '1' },
          '76561198123684347':
           { roundsplayed: '20',
             name: 'Weeb as fuck',
             damage: '1204',
             firstkill_t: '2',
             kills: '7',
             deaths: '19',
             '1kill_rounds': '4',
             assists: '6',
             firstdeath_t: '3',
             headshot_kills: '3',
             firstkill_ct: '2',
             '3kill_rounds': '1' },
          '76561197965168031':
           { roundsplayed: '20',
             name: 'Aios',
             deaths: '19',
             damage: '887',
             kills: '5',
             assists: '1',
             '1kill_rounds': '3',
             headshot_kills: '3',
             firstdeath_t: '1',
             '2kill_rounds': '1',
             firstkill_ct: '1',
             firstdeath_ct: '1' },
          score: '4' },
           mapname: 'de_inferno',
           winner: 'team2',
           demo_filename: '1593900065_map1_de_inferno.dem' 
        } 
      };
  })
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
    });
    it('playerMapSteamIdStats2', async () => {
      const playerMappedStats = playerMapSteamIdStats(gameObject, stats2);
      console.log(playerMappedStats);
    });
  });
});