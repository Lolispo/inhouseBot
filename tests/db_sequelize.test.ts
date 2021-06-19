'use strict';
// Author: Petter Andersson

import { assert } from 'chai';
import { describe } from 'mocha';
import { addMissingUsers, initializeDBSequelize } from '../src/database/db_sequelize';
import { createPlayer } from '../src/game/player';
import { getConfig } from '../src/tools/load-environment';
import { getHighScore, getUsers, getRatingUser, createUser, createRatingForUser, 
  DatabaseSequelize, removeUser, createMatch,
  bestTeammates,
 } from '../src/database/db_sequelize';

const test_id = '1';
const test_game = 'cs1v1';
const test_mmr = 2500;
const contextualDescribe = (process.env.TEST_ENV == "testwithoutdb" ? describe.skip : describe);

contextualDescribe('db_sequelize', () => {
  let databaseConnection;
  // TODO: Move player dependent tests into one describe
  before(async () => {
    databaseConnection = await initializeDBSequelize(getConfig().db);
    DatabaseSequelize.instance = databaseConnection;
    assert.ok(databaseConnection.Users);
    assert.ok(databaseConnection.Ratings);
    for (let i = 1; i <= 4; i++) {
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
      const res = await getHighScore(test_game, 5);
      res.forEach((entry) => console.log('highscore ' + entry.dataValues.userName + ' ' + entry.dataValues[test_game]));
      assert.equal(res.length, 5);
    })
  }),
  describe('addMissingUsers', () => {
    it('addMissingUsers', async () => {
      const players = [
        createPlayer('Test1', '6'),
        createPlayer('Test2', '7'),
      ]
      const res = await addMissingUsers(players, [], test_game, () => console.log('Test Callback'));
    })
  }),
  describe('createUser', () => {
    it('createUser', async () => {
      /*
      const players = [
        createPlayer('Test1', '1'),
        createPlayer('Test2', '2'),
        createPlayer('Test3', '3'),
        createPlayer('Test4', '4')
      ]
      const res = await getUsers(players);
      res.forEach((entry) => console.log('getUsers ' + entry.dataValues.userName + ' ' + entry.dataValues[test_game]));
      if (res.length === 0) {
        for (let i = 0; i < players.length; i++) {
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
      */
    })
  })
  describe('createMatch', () => {
    /*
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
      const balanceInfo: IBalanceInfo = {
        game: game,
        team1Name: team1Name,
        team2Name: team2Name,
        team1: players.slice(0, 2),
        team2: players.slice(2),
        avgDiff: 0,
        avgT1: 2500,
        avgT2: 2500,
        difference: 0
      }
      const result = 1;
      const matchResult = await createMatch(result, balanceInfo, {
        t1: 25,
        t2: 25,
      }, undefined, undefined, undefined);
      console.log(matchResult);
    });
    */
  })
  describe('createRatingForUser', () => {
    it('createRatingForUser', async () => {
      /*
      const res = await createRatingForUser(test_id, test_username, test_mmr, test_game);
      console.log('createRatingForUser ' + res.dataValues.userName + ' ' + res.mmr);
      assert.equal(res.dataValues.userName, test_username);
      */
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
    const game = 'dota';
    const uid = '96293765001519104';
    it('bestTeammates', async () => {
      const res = await bestTeammates(uid, game);
      console.log('@test res:', res);
    })
    it('bestTeammates', async () => {
      const res = await bestTeammates('123', game);
      console.log('@test res:', res);
    })
  })
  after(async () => {
    for (let i = 1; i <= 4; i++) {
      const res = await removeUser(test_id + i);
      assert.ok(res);
    }
  })
});