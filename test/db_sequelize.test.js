'use strict';
// Author: Petter Andersson

const assert = require('assert');
const rewire = require('rewire');
const { initializeDBSequelize } = require('../src/database/db_sequelize');
const { createPlayer } = require('../src/game/player');
const { getConfig } = require('../src/tools/load-environment');
const db_sequelize = rewire('../src/database/db_sequelize.js');
const getHighScore = db_sequelize.__get__('getHighScore');
const getUsers = db_sequelize.__get__('getUsers');
const getRatingUser = db_sequelize.__get__('getRatingUser');
const createUser = db_sequelize.__get__('createUser');
const createRatingForUser = db_sequelize.__get__('createRatingForUser');
const DatabaseSequelize = db_sequelize.__get__('DatabaseSequelize');
const removeUser = db_sequelize.__get__('removeUser');
const createMatch = db_sequelize.__get__('createMatch');
const bestTeammates = db_sequelize.__get__('bestTeammates');

const test_username = 'Test';
const test_id = '1';
const test_game = 'cs1v1';
const test_mmr = 2500;

describe('db_sequelize', () => {
  let databaseConnection;
  // TODO: Move player dependent tests into one describe
  before(async () => {
    databaseConnection = await initializeDBSequelize(getConfig().db);
    DatabaseSequelize.instance = databaseConnection;
    assert.ok(databaseConnection.Users);
    assert.ok(databaseConnection.Ratings);
    for(let i = 1; i <= 4; i++) {
      const res = await removeUser(test_id + i);
    }
  }),
  describe('getInstance', () => {
    it('getInstance', async () => {
      const databaseConnection = DatabaseSequelize.instance;
      assert.ok(databaseConnection);
    })
  }),
  describe('getHighScore', () => {
    it('getHighScore', async () => {
      const res = await getHighScore(test_game, 5, () => {});
      res.forEach((entry) => console.log('highscore ' + entry.dataValues.userName + ' ' + entry.dataValues[test_game]));
      assert.equal(res.length, 5);
    })
  }),
  describe('createUser', () => {
    it('createUser', async () => {
      const players = [
        createPlayer('Test1', '1'),
        createPlayer('Test2', '2'),
        createPlayer('Test3', '3'),
        createPlayer('Test4', '4')
      ]
      const res = await getUsers(players);
      res.forEach((entry) => console.log('getUsers ' + entry.dataValues.userName + ' ' + entry.dataValues[test_game]));
      if (res.length === 0) {
        for(let i = 0; i < players.length; i++) {
          const res = await createUser((i+1) + '', test_username + i, test_mmr);
          console.log('createUser', res.dataValues);
        }
        const res2 = await getUsers(players);
        res2.forEach((entry) => console.log('getUsers ' + entry.dataValues.userName + ' ' + entry.dataValues[test_game]));
        assert.equal(res2.length, 4);
      } else if (res.length === 1) {
        assert.equal(res[0].dataValues.userName, 'Test');
        assert.equal(res[0].dataValues[test_game], test_mmr);
      }
    })
  })
  describe('createMatch', () => {
    it('createMatch', async () => {
      // TODO: Save players in database for foreign key constraint to work
      const players = [
        createPlayer('Test1', '1'),
        createPlayer('Test2', '2'),
        createPlayer('Test3', '3'),
        createPlayer('Test4', '4')
      ];
      const game = test_game;
      const team1Name = 'team 1 name';
      const team2Name = 'team 2 name';
      const balanceInfo = {
        game: game,
        team1Name: team1Name,
        team2Name: team2Name,
        team1: players.slice(0, 2),
        team2: players.slice(2)
      }
      const result = 1;
      const matchResult = await createMatch(result, balanceInfo) 
      console.log(matchResult);
    });
  })
  describe('createRatingForUser', () => {
    it('createRatingForUser', async () => {
      const res = await createRatingForUser(test_id, test_username, test_mmr, test_game);
      console.log('createRatingForUser ' + res.dataValues.userName + ' ' + res.mmr);
      assert.equal(res.dataValues.userName, test_username);
    })
  })
  describe('getRatingUser', () => {
    it('getRatingUser', async () => {
      const res = await getRatingUser(test_id, test_game);
      res.forEach((entry) => console.log('getRatingUser ' + entry.dataValues.userName + ' ' + entry.mmr));
      assert.equal(res[0].dataValues.mmr, test_mmr);
      assert.equal(res.length, 1);
    })
    it('getRatingUser invalid', async () => {
      const res = await getRatingUser(test_id +'2', test_game);
      res.forEach((entry) => console.log('getRatingUser ' + entry.dataValues.userName + ' ' + entry.mmr));
      assert.equal(res.length, 0);
    })
  })
  describe('bestTeammates', () => {
    it('bestTeammates', async () => {
      const res = await bestTeammates(test_id, test_game);
    })
  })
  after(async () => {
    for(let i = 1; i <= 4; i++) {
      const res = await removeUser(test_id + i);
      assert.ok(res);
    }
  })
});
